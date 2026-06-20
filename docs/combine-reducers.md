# Combined Reducers (combineReducers)

[← README.md](../README.md#-learn-more) | [🌱](./ai/combine-reducers.opt.yaml)

## Overview

`combineReducers` composes several focused **slice reducers** into a single dispatcher
that exposes **one combined state tree** (per-domain slices), **one dispatch surface**,
and **one `getState`/`addListener` surface. It is the Rotor-idiomatic answer to a
Redux-style root store, adapted to the cross-thread MVI model.

A slice only ever **writes** its own slice, but it may **read** the other slices via
`m.rootState` (a read-only view of the full combined tree during the slice reduce), so a
slice can derive its state from another. Cross-slice writes that depend on a freshly
committed slice are sequenced by dispatching a **follow-up intent** (queued and drained
after the current cycle).

Use it when a business module is a composite of several sub-domains that share state, but
you still want one surface for the consumer.

> Opt-in and backward compatible: existing single dispatchers keep working unchanged. A
> combined dispatcher is just an ordinary dispatcher whose reducer happens to fan out.

## When to use it

- A module has multiple sub-domains (e.g. `auth`, `purchase`, `entitlement`) that must
  share a slice and derive from each other.
- You want a single dispatch/getState/listener surface for the whole module.
- You want per-domain reducers (clear ownership) instead of one monolithic reducer.

Keep combined dispatchers **module-scoped** (one per business module). Do **not** build a
single app-global root store — see [Threading & performance](#threading--performance).

## API

### `Rotor.combineReducers(config)`

```brightscript
combined = Rotor.combineReducers({
    slices: {
        auth:        new AuthSliceReducer(),
        purchase:    new PurchaseSliceReducer(),
        entitlement: new EntitlementSliceReducer()
    }
})
```

Returns a `Rotor.CombinedReducer` (extends `Rotor.Reducer`). Register it like any reducer:

```brightscript
Rotor.createDispatcher("account", new Rotor.Model({
    auth:        { token: invalid, status: "anon" },
    purchase:    { receipt: invalid, subscription: invalid },
    entitlement: { access: [], subscription: invalid }
}), combined)
```

The `Model`'s initial state must mirror the slice names: one key per slice.

### Slice reducers

A slice reducer is an ordinary `Rotor.Reducer`. Its `reducer()` receives **its own slice**
as the state argument and returns the new slice (immutable: return a fresh object when it
changes, the same reference when it does not).

To **read** other slices (derived/shared state), use `m.rootState` — a read-only view of
the full combined tree, available for the duration of the slice reduce. A slice only ever
**writes** its own slice.

```brightscript
class EntitlementSliceReducer extends Rotor.Reducer
    override function reducer(slice as object, intent as Intent) as object
        if intent.type = "ENTITLEMENT_FETCH"
            newSlice = Rotor.Utils.deepCopy(slice)
            ' cross-slice READ via m.rootState (purchase owns subscription)
            newSlice.subscription = m.rootState.purchase.subscription
            access = []
            if m.rootState.auth.status = "authed" then access.push("base")
            if m.rootState.purchase.subscription = "premium" then access.push("premium")
            newSlice.access = access
            return newSlice
        end if
        return slice
    end function
end class
```

Slice reducers keep their own `applyMiddlewares()` and `onSourceEvent()` for async work.
A slice's `m.dispatch(intent)` re-enters the **combined** pipeline (so the intent goes
through all slices).

### Cross-slice effects (follow-up dispatch)

Each slice sees the **previous committed** combined tree as its read-only `m.rootState`.
So within a single dispatch a slice cannot read another slice's *brand-new* value — it sees
the previous one. To act on a freshly committed slice, dispatch a **follow-up intent**:

```brightscript
' 1) commit auth
fw.dispatchTo("account", { type: "AUTH_LOGIN_SUCCEEDED", payload: { token: "t1" } })
' 2) derive entitlement from the now-committed auth slice
fw.dispatchTo("account", { type: "ENTITLEMENT_FETCH" })
```

The follow-up can come from the consumer (as above) or from a slice/middleware that calls
`m.dispatch({ type: "ENTITLEMENT_FETCH" })`. Re-entrant dispatches (a slice or listener
dispatching during reduce/notify) are **queued and drained after the current cycle**, so
each cycle still emits exactly one state update (one `CopyMessage` to render). If a slice
dispatches its own follow-up, make sure the triggering condition is edge-based so the
follow-up does not loop.

## Consuming a combined dispatcher

It behaves like any dispatcher. The whole combined tree is the state.

```brightscript
fw.dispatchTo("account", { type: "AUTH_LOGIN_SUCCEEDED", payload: { token: "t1" } })
fw.dispatchTo("account", { type: "ENTITLEMENT_FETCH" })

state = fw.getStateFrom("account")   ' { auth: {...}, purchase: {...}, entitlement: {...} }
?state.entitlement.access            ' ["base"] — derived from the committed auth slice
```

### Listeners (whole tree)

```brightscript
facade = fw.connectDispatcher("account")
facade.addListener({
    callbackWithState: sub(state)
        m.getViewModel().onAccount(state)
    end sub
})
```

### Listeners (single slice)

There is **no `selectSlice()` helper**: BrightScript anonymous functions cannot capture
local variables, so a closure-based factory cannot carry the slice name into the callback.
Subscribe inline with the slice key as a literal (it lives inside the callback):

```brightscript
facade.addListener({
    callbackWithState: sub(state)
        m.getViewModel().onEntitlement(state.entitlement)
    end sub
})
```

To fire only when a slice actually changed, compare the slice reference (unchanged slices
keep their previous reference):

```brightscript
facade.addListener({
    allowUpdate: function(state) as boolean
        changed = not (m.__lastAuth = state.auth)
        m.__lastAuth = state.auth
        return changed
    end function,
    callbackWithState: sub(state) m.onAuth(state.auth) end sub
})
```

## How it works

1. `dispatch(intent)` → combined `reducer(state, intent)`.
2. For each slice: `next[name] = slice.reduceSlice(state[name], intent, state)` — each
   child reduces its own slice and sees the **previous committed** combined tree as its
   read-only `m.rootState`.
3. The new combined tree is committed, delivered to render once, and listeners fire.
4. Any follow-up intents enqueued during the cycle drain afterwards (each as its own full
   cycle).

Unchanged slices keep their reference, so listeners can detect per-slice change by
reference comparison. Cross-slice **writes** are sequenced through follow-up intents, so by
the time a follow-up runs, the slice it reads is already committed.

### Async source events

A combined dispatcher has one reducer, so source events arrive at the combined reducer and
are **fanned out to every child** `onSourceEvent(msg)`. Each child must verify the event is
its own (e.g. by source identity) and ignore foreign events.

## Threading & performance

- Put the whole module (combiner + slice reducers) on **one task thread**. All intra-module
  coordination is then synchronous and in-thread — no rendezvous.
- Every dispatch serializes the **entire combined tree** to the render thread via
  `CopyMessage`. This is serialization cost, not rendezvous. Keep combined dispatchers
  **module-scoped**; a single app-global root store would ship a large payload on every
  small change.
- Each changed slice is `deepCopy`-ed; unchanged slices are not copied (reference kept).
  Watch `deepCopy` cost on hot/large slices.

## Notes / gotchas

- The reducer's return value is committed to the model. In-place mutating reducers (the
  classic Rotor style) return the same reference, so nothing changes for them; combined
  reducers return a fresh tree, which is now written back to the model (so `getState()`
  reflects it).
- A slice sees the **previous** committed tree via `m.rootState`; to read a freshly
  committed slice, sequence a follow-up intent.
- If a slice/middleware dispatches its own follow-up, keep the trigger edge-based, or the
  follow-up can loop.
- Slices read across via `m.rootState`; they must only write their own slice.

## Example: account composite (full)

```brightscript
class AuthSliceReducer extends Rotor.Reducer
    override function reducer(slice as object, intent as Intent) as object
        if intent.type = "AUTH_LOGIN_SUCCEEDED"
            newSlice = Rotor.Utils.deepCopy(slice)
            newSlice.token = intent.payload.token
            newSlice.status = "authed"
            return newSlice
        end if
        return slice
    end function
end class

class PurchaseSliceReducer extends Rotor.Reducer
    override function reducer(slice as object, intent as Intent) as object
        if intent.type = "PURCHASE_CONFIRMED"
            newSlice = Rotor.Utils.deepCopy(slice)
            newSlice.receipt = intent.payload.receipt
            newSlice.subscription = intent.payload.subscription
            return newSlice
        end if
        return slice
    end function
end class

class EntitlementSliceReducer extends Rotor.Reducer
    override function reducer(slice as object, intent as Intent) as object
        if intent.type = "ENTITLEMENT_FETCH"
            newSlice = Rotor.Utils.deepCopy(slice)
            access = []
            if m.rootState.auth.status = "authed" then access.push("base")
            if m.rootState.purchase.subscription = "premium" then access.push("premium")
            newSlice.access = access
            newSlice.subscription = m.rootState.purchase.subscription
            return newSlice
        end if
        return slice
    end function
end class

' Task thread setup
sub taskFunction()
    Rotor.createDispatcher("account", new Rotor.Model({
        auth:        { token: invalid, status: "anon" },
        purchase:    { receipt: invalid, subscription: invalid },
        entitlement: { access: [], subscription: invalid }
    }), Rotor.combineReducers({
        slices: {
            auth:        new AuthSliceReducer(),
            purchase:    new PurchaseSliceReducer(),
            entitlement: new EntitlementSliceReducer()
        }
    }))
    m.appFw.sync()
end sub
```

To derive entitlement after login, dispatch the follow-up explicitly (`AUTH_LOGIN_SUCCEEDED`
then `ENTITLEMENT_FETCH`). See `src/source/tests/baseTest/CombinedReducerTest.spec.bs` for
the runnable, tested version of this example.
