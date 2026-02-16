# Observer Configuration

[← README.md](../README.md#-learn-more) | [🌱](./ai/view-builder-observer-plugin.opt.yaml)

## Overview

The Observer Plugin provides declarative field observation for SceneGraph nodes. It enables monitoring node field changes through an `observer` configuration, supporting single observers, multiple observers per widget, callback routing, and automatic lifecycle management.

## Observer Configuration Value Types

| Type | Description | Example |
|------|-------------|---------|
| Single Object | One observer per widget | `observer: { fieldId: "text", callback: ... }` |
| Array | Multiple observers per widget | `observer: [{ fieldId: "state" }, { fieldId: "position" }]` |

### Observer Configuration Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `fieldId` | string | Yes | Name of the SceneGraph field to observe |
| `callback` | function | *  | Function called with parsed payload when field changes |
| `handler` | function | *  | Function called without arguments when field changes |
| `id` | string | No | Custom identifier for the observer |
| `value` | dynamic | No | Initial value to set on the field |
| `alwaysNotify` | boolean | No | Trigger callback even if value unchanged (default: true) |
| `once` | boolean | No | Remove observer after first callback (default: false) |
| `until` | function | No | Function returning true when observer should be removed |
| `parsePayload` | function | No | Transform payload before passing to callback |
| `infoFields` | array | No | Additional fields to include in callback payload |

> **\*** One of `callback` or `handler` is required. They are mutually exclusive — configure one or the other, not both. If neither is provided, the framework throws an error.

### Observer Value Examples

```brightscript
{
    nodeType: "Video",

    ' Single observer - one field
    observer: {
        fieldId: "state",
        callback: sub(payload)
            print "State: " + payload.state
        end sub
    },

    ' Multiple observers - array of observers
    observer: [
        {
            fieldId: "state",
            callback: sub(payload)
                print "State changed: " + payload.state
            end sub
        },
        {
            fieldId: "position",
            callback: sub(payload)
                print "Position: " + payload.position.toStr()
            end sub
        }
    ]
}
```

### callback vs handler

Use **`callback`** when you need to read the changed field value:

```brightscript
observer: [{
    fieldId: "state",
    callback: sub(payload)
        if payload.state = "finished"
            m.getViewModel().onVideoFinished()
        end if
    end sub
}]
```

- Signature: `sub(payload as object)` or `sub(payload) typecast m as Rotor.Widget`
- `payload` is an AA containing the changed field value (keyed by `fieldId`) plus any `extraInfo`/`infoFields`

Use **`handler`** when you only need the notification trigger, not the value:

```brightscript
' renderTracking: reposition after layout completes
observer: [{
    fieldId: "renderTracking",
    handler: sub()
        m.node.translation = [100, 200]
    end sub
}]

' Timer: react to timer fire event
observer: [{
    fieldId: "fire",
    handler: sub()
        m.getViewModel().onTimerFired()
    end sub
}]
```

- Signature: `sub()` or `sub() typecast m as Rotor.Widget`
- Ideal for `renderTracking` observers, timer callbacks, and simple refresh triggers

**Usage in Observer Callbacks:**

```brightscript
observer: {
    fieldId: "state",
    callback: sub(payload) typecast m as Rotor.Widget
        typecast m as Rotor.Widget
        ' Now IDE provides autocomplete for:
        m.getWidget("childId")
        m.render({ ... })
        m.viewModelState.customProperty
    end sub
}
```

### Type Safety with Typecast (Optional)

The `typecast` statement is a BrighterScript V1 feature that provides type information to the language server and IDE. It is **entirely optional** and has no runtime effect - it only improves development experience.
Type examples: `Rotor.Widget`, `Rotor.ViewModel`, or any class that extends them.

**Benefits:**
- **IDE Autocomplete**: Enables IntelliSense/autocomplete for widget methods and properties
- **Type Safety**: Catches type errors during development before runtime
- **Documentation**: Makes code intent clearer for other developers


**Note**: Without `typecast`, the code works identically at runtime. Use it only when you need IDE support for widget-specific methods or when working in teams where type safety improves code quality.

## Lifecycle Integration

The Observer Plugin operates automatically through widget lifecycle:

| Lifecycle Hook | Purpose |
|----------------|---------|
| `beforeMount` | Register observers when widget mounts |
| `beforeUpdate` | Detach old observers, register new observers |
| `beforeDestroy` | Unobserve fields and cleanup observer instances |

### Observer Processing Pipeline

1. **Configuration Parse**: Plugin processes observer config (single object or array)
2. **Attachment ID Generation**: Unique ID created per node attachment
3. **Helper Interface Setup**: Internal field added to node for observer tracking
4. **Observer Registration**: Creates Observer instance, stores in ObserverStack
5. **Native Observation**: Calls `node.observeFieldScoped()` with routing info
6. **Callback Routing**: Field changes route to correct Observer via callback router
7. **Payload Processing**: Optional `parsePayload` transformation before callback
8. **Callback/Handler Execution**: `callback` executed in widget scope with payload, or `handler` executed with no arguments
9. **Cleanup**: Observers automatically detached on widget destroy or update

## Common Patterns

### Video Player State Monitoring

```brightscript
{
    nodeType: "Video",
    observer: [
        {
            fieldId: "state",
            callback: sub(payload)
                if payload.state = "playing"
                    m.node.visible = true
                else if payload.state = "finished"
                    m.handleVideoFinished()
                end if
            end sub
        },
        {
            fieldId: "position",
            callback: sub(payload)
                m.updateProgressBar(payload.position)
            end sub
        }
    ]
}
```

### One-Time Observer with `once`

```brightscript
{
    nodeType: "Label",
    observer: {
        fieldId: "loadComplete",
        once: true,
        callback: sub(payload)
            ' This callback only fires once, then observer is removed
            print "Load complete!"
        end sub
    }
}
```

### Conditional Observer with `until`

```brightscript
{
    nodeType: "Animation",
    observer: {
        fieldId: "state",
        until: function(payload)
            ' Remove observer when animation finishes
            return payload.state = "finished"
        end function,
        callback: sub(payload)
            m.updateAnimationState(payload.state)
        end sub
    }
}
```

### Payload Transformation with `parsePayload`

```brightscript
{
    nodeType: "Label",
    observer: {
        fieldId: "text",
        parsePayload: function(payload) as object
            ' Transform payload before callback
            return {
                text: payload.text,
                length: Len(payload.text),
                timestamp: CreateObject("roDateTime").AsSeconds()
            }
        end function,
        callback: sub(payload)
            print "Text: " + payload.text
            print "Length: " + payload.length.toStr()
        end sub
    }
}
```

### Setting Initial Field Value

```brightscript
{
    nodeType: "Group",
    observer: {
        fieldId: "customState",
        value: "initial",        ' Sets field initial value
        alwaysNotify: true,      ' Triggers callback even if value unchanged
        callback: sub(payload)
            print "State: " + payload.customState
        end sub
    }
}
```

## Best Practices

### 1. Use `once` for One-Time Events

```brightscript
' Good: Remove observer after single event
observer: {
    fieldId: "loadComplete",
    once: true,
    callback: sub(payload)
        m.handleLoadComplete()
    end sub
}

' Avoid: Manual cleanup in callback
observer: {
    fieldId: "loadComplete",
    callback: sub(payload)
        m.handleLoadComplete()
        ' Forgot to remove observer - memory leak
    end sub
}
```

### 2. Use `parsePayload` to Reduce Callback Complexity

```brightscript
' Good: Clean separation of concerns
observer: {
    fieldId: "text",
    parsePayload: function(payload) as object
        return {
            text: payload.text,
            length: Len(payload.text)
        }
    end function,
    callback: sub(payload)
        m.updateTextStats(payload.text, payload.length)
    end sub
}

' Less clean: All logic in callback
observer: {
    fieldId: "text",
    callback: sub(payload)
        text = payload.text
        length = Len(payload.text)
        m.updateTextStats(text, length)
    end sub
}
```

### 3. Group Related Observers in Array

```brightscript
' Good: Related observers together
observer: [
    { fieldId: "state", callback: m.onStateChange },
    { fieldId: "position", callback: m.onPositionChange }
]

' Avoid: Scattered observer definitions
observer: { fieldId: "state", callback: m.onStateChange }
' ... other config ...
' (position observer defined elsewhere or forgotten)
```

### 4. Use `handler` for Notification-Style Observers

```brightscript
' Good: handler for renderTracking, timers, and triggers where the value is irrelevant
observer: {
    fieldId: "renderTracking",
    handler: sub()
        m.node.translation = [100, 200]
    end sub
}

' Avoid: callback with an unused parameter
observer: {
    fieldId: "renderTracking",
    callback: sub(payload)
        ' payload is never used — use handler instead
        m.node.translation = [100, 200]
    end sub
}
```

> `parsePayload` still executes when `handler` is used, but its result is discarded. Omit `parsePayload` when using `handler` for clarity.

### 5. Use `until` for Conditional Cleanup

```brightscript
' Good: Automatic cleanup when condition met
observer: {
    fieldId: "progress",
    until: function(payload)
        return payload.progress >= 100
    end function,
    callback: sub(payload)
        m.updateProgress(payload.progress)
    end sub
}

' Less clean: Manual condition checking
observer: {
    fieldId: "progress",
    callback: sub(payload)
        if payload.progress >= 100
            ' Need to manually unobserve - error prone
        else
            m.updateProgress(payload.progress)
        end if
    end sub
}
```

## Common Pitfalls

1. **Observing Non-Existent Fields**: Field doesn't exist on node type
   - Solution: Verify field exists for specific SceneGraph node type

2. **Memory Leaks**: Forgetting to clean up observers
   - Solution: Plugin handles cleanup automatically in lifecycle

3. **Callback Scope Issues**: `m` context in callbacks
   - Solution: Use `typecast m as Rotor.Widget` if needed for type safety

4. **Missing Callback/Handler**: Observer configured without `callback` or `handler`
   - Solution: Always provide one of `callback` or `handler` (mutually exclusive, one is required)

5. **Crash on `callback` with No Parameters**: If your function is defined as `sub()` but configured with `callback:` instead of `handler:`, it will crash because the framework passes a payload argument
   - Solution: Switch to `handler:` for zero-argument callbacks

6. **Payload Structure Assumptions**: Assuming payload format
   - Solution: Use `parsePayload` to normalize payload structure

7. **Heavy Callback Operations**: Expensive operations in callbacks
   - Solution: Keep callbacks lightweight, defer heavy work

## Troubleshooting

### Observer Not Firing

```brightscript
' Debug observer setup
sub debugObserver(widget as object)
    print "Widget ID: " + widget.id
    print "Node Type: " + widget.nodeType
    print "Observer Config: " + FormatJson(widget.observer)

    ' Check if field exists on node
    if widget.node.hasField("yourFieldId")
        print "Field exists on node"
        print "Current value: " + widget.node.getField("yourFieldId").toStr()
    else
        print "ERROR: Field does not exist on node type " + widget.node.subtype()
    end if
end sub
```

### Callback Not Executing

- **Check field name**: Ensure `fieldId` matches exact SceneGraph field name
- **Verify node type**: Confirm field exists for specific node type
- **Test field changes**: Manually change field to verify observation works
- **Check callback function**: Ensure callback is valid function reference
- **Inspect payload**: Print payload in callback to see what's received

### Performance Issues

- **Profile callbacks**: Measure callback execution time
- **Reduce observer count**: Combine related observations when possible
- **Optimize parsePayload**: Keep payload processing minimal and fast
- **Use `once` and `until`**: Remove observers when no longer needed

---

## 📚 Learn More

**NEXT STEP: [Focus Plugin](./view-builder-focus-plugin.md)**

**Reference Documentation:**
- [Framework Initialization](./framework-initialization.md) - Configuration, task synchronization, and lifecycle
- [ViewBuilder Overview](./view-builder-overview.md) - High-level architecture and concepts
- [Widget Reference](./view-builder-widget-reference.md) - Complete Widget properties, methods, and usage patterns
- [ViewModel Reference](./view-builder-viewmodel-reference.md) - Complete ViewModel structure, lifecycle, and state management

**Plugin Documentation:**
- [Fields Plugin](./view-builder-fields-plugin.md) - Field management with expressions and interpolation
- [FontStyle Plugin](./view-builder-fontstyle-plugin.md) - Typography and font styling
- [Focus Plugin](./view-builder-focus-plugin.md) - Focus management and navigation

**Additional Documentation:**
- [Cross-Thread MVI design pattern](./cross-thread-mvi.md) - State management across threads
- [Internationalization support](./i18n-support.md) - Locale-aware interface implementation
