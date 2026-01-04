# Focus Configuration

[← README.md](../README.md#-learn-more) | [🌱](./ai/view-builder-focus-plugin.opt.yaml)

## Overview

The Focus Plugin provides advanced focus management and spatial navigation for TV-friendly interfaces. It implements hierarchical focus groups, automatic spatial navigation based on widget positions, static navigation paths, long press detection, and automatic state management through `viewModelState.isFocused`.

## Config Value Types

| Type | Description | Example |
|------|-------------|---------|
| Focus Item | Individual focusable widget | `focus: { isEnabled: true, onSelect: ... }` |
| Focus Group | Container managing navigation between items | `focus: { group: { defaultFocusId: "firstButton" } }` |

**Focus Item**: Widget that can receive focus directly (buttons, cards, menu items).
**Focus Group**: Container widget managing navigation between child focus items (menus, carousels, grids).

## Core Concepts

### Bubbling vs Capturing

The Focus Plugin implements two complementary focus resolution strategies:

#### 1. Bubbling Focus - "Upward Search"

**When**: User interaction (key press) cannot find target within current scope
**Direction**: Child → Parent → Grandparent (upward through ancestors)
**Purpose**: "I can't navigate further, ask my parents for direction"

Example: User presses UP from a focused item, but there's no item above. The plugin "bubbles up" through ancestor groups to find an alternative navigation path defined at a higher level.

#### 2. Capturing Focus - "Downward Rescue"

**When**: Need to resolve abstract target (group ID or string ID) to concrete focus item
**Direction**: Group → Nested Group → FocusItem (downward through descendants)
**Purpose**: "Found a group/ID, find the actual focusable item"

This is a "rescue operation" that converts:
- Group reference → concrete FocusItem
- ID string → actual widget with focus capability

Example: Bubbling found "menuGroup", but we need a specific focusable item. Capturing recursively descends through the group's `defaultFocusId` chain until it finds a real FocusItem.

#### Deep Search Enhancement

The capturing process searches deeply in hierarchies. If `defaultFocusId` doesn't match immediate children, it will:
- Search all descendant FocusItems (any depth)
- Search all nested Groups (any depth)
- Apply fallback logic if a matching Group is found

This means `defaultFocusId: "deepItem"` will find "deepItem" even if it's 3+ levels deep in the hierarchy!

**Together they work as**: User Action → Bubbling (↑ find alternative) → Capturing (↓ resolve target)

## Focus Item Configuration Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isEnabled` | boolean | `true` | Enable/disable focus capability |
| `enableNativeFocus` | boolean | `false` | Allow native SceneGraph focus |
| `enableSpatialNavigation` | boolean | `true` | Enable automatic spatial navigation |
| `up` / `down` / `left` / `right` / `back` | string/function | `""` | Static navigation directions (node ID or function returning ID) |
| `onFocusChanged` | function | `invalid` | Called when focus state changes with `isFocused` parameter |
| `onFocus` | function | `invalid` | Called when widget gains focus |
| `onBlur` | function | `invalid` | Called when widget loses focus |
| `onSelect` | function | `invalid` | Called when OK button is pressed while focused |
| `longPressHandler` | function | `invalid` | Handle long press events with `isLongPress` and `key` parameters |

## Focus Group Configuration Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `group.defaultFocusId` | string/function | `""` | Default focus target when group receives focus |
| `group.lastFocusedHID` | string | `""` | Automatically remembers last focused item in group |
| `group.enableSpatialEnter` | boolean | `false` | Enable spatial navigation when entering group from direction |
| `group.up` / `down` / `left` / `right` / `back` | string/function | `""` | Navigation directions to other groups/items |
| `group.onFocusChanged` | function | `invalid` | Called when group focus chain state changes |

## Lifecycle Integration

| Lifecycle Hook | Purpose |
|----------------|---------|
| `beforeMount` | Register focus item or group when widget mounts |
| `beforeUpdate` | Remove old focus config, apply new focus config |
| `beforeDestroy` | Unregister focus item/group and cleanup instances |

### Focus Processing Pipeline

1. **Configuration Parse**: Plugin determines if widget is Focus Item or Focus Group
2. **Instance Creation**: Creates FocusItem or Group instance with configuration
3. **Registration**: Stores instance in FocusItemStack or GroupStack
4. **Hierarchy Tracking**: Registers parent-child relationships for bubbling
5. **State Initialization**: Sets `viewModelState.isFocused = false` automatically
6. **Focus Application**: When focus set, calls `onFocusChanged`, `onFocus`/`onBlur` callbacks
7. **State Update**: Updates `viewModelState.isFocused` and `node.isFocused` field
8. **Navigation Handling**: Processes key events through static → spatial → bubbling priority
9. **Group Notification**: Notifies ancestor groups of focus chain changes
10. **Cleanup**: Removes focus config and instances on widget destroy

## Injected Widget Methods

Widgets with focus configuration automatically receive these methods via `widget.plugins.focus`:

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `setFocus` | `isFocused` (boolean/string), `enableNativeFocus` (boolean) | boolean | Set focus on current widget (boolean) or target widget (string ID) |
| `getFocusedWidget` | None | object | Returns currently focused widget instance |
| `enableFocusNavigation` | `enabled` (boolean) | void | Globally enable/disable focus navigation |
| `isFocusNavigationEnabled` | None | boolean | Check if focus navigation is enabled |
| `proceedLongPress` | None | object | Manually trigger long press navigation action |
| `isLongPressActive` | None | boolean | Check if long press is currently active |
| `triggerKeyPress` | `key` (string) | object | Simulate key press for testing or programmatic navigation |
| `setGroupLastFocusedHID` | `id` (string) | void | Update the lastFocusedHID of this widget's focus group. If called on a group, updates its own lastFocusedHID. If called on a focus item, finds and updates the parent group's lastFocusedHID. |

## Common Patterns

### Simple Button with Focus Styling

```brightscript
{
    id: "simpleButton",
    nodeType: "Rectangle",
    focus: {
        isEnabled: true,
        onFocusChanged: sub(isFocused as boolean)
            if isFocused
                m.node.blendColor = "0xFF0000FF" ' Red when focused
            else
                m.node.blendColor = "0xFFFFFFFF" ' White when not focused
            end if
            ' Note: m.viewModelState.isFocused is automatically updated
        end sub,
        onSelect: sub()
            m.getViewModel().handleButtonClick()
        end sub
    }
}
```

### Sidebar + Content Navigation

```brightscript
' Sidebar group - blocks right exit except for explicit item direction
{
    id: "sidebar",
    focus: {
        group: {
            defaultFocusId: "homeMenuItem",
            right: true ' Block accidental exit to content
        }
    },
    children: [
        {
            id: "homeMenuItem",
            focus: {
                right: "contentFirst", ' Explicit exit to content
                onSelect: sub()
                    m.getViewModel().navigateToHome()
                end sub
            }
        }
    ]
}

' Content area
{
    id: "content",
    focus: {
        group: {
            defaultFocusId: "contentFirst",
            left: "sidebar" ' Return to sidebar
        }
    }
}
```

### Modal Dialog (Locked)

```brightscript
' Modal that captures all focus - cannot exit
{
    id: "modal",
    focus: {
        group: {
            defaultFocusId: "confirmButton",
            left: true,   ' Block all directions
            right: true,
            up: true,
            down: true,
            back: true    ' Block back button too
        }
    },
    children: [
        {
            id: "confirmButton",
            focus: {
                onSelect: sub()
                    m.getViewModel().handleConfirm()
                    ' Modal will be destroyed, releasing focus
                end sub
            }
        },
        {
            id: "cancelButton",
            focus: {
                onSelect: sub()
                    m.getViewModel().handleCancel()
                end sub
            }
        }
    ]
}
```

### Nested Navigation Groups

```brightscript
{
    id: "outerGroup",
    focus: {
        group: {
            defaultFocusId: "innerGroup",
            down: "bottomBar" ' Catches bubbling from inner groups
        }
    },
    children: [
        {
            id: "innerGroup",
            focus: {
                group: {
                    defaultFocusId: "menuItem1",
                    down: undefined ' No direction - bubbles to parent
                }
            },
            children: [
                {
                    id: "menuItem1",
                    focus: { onSelect: sub()
                        m.getViewModel().selectMenuItem(1)
                    end sub }
                },
                {
                    id: "menuItem2",
                    focus: { onSelect: sub()
                        m.getViewModel().selectMenuItem(2)
                    end sub }
                }
            ]
        }
    ]
}

{
    id: "bottomBar",
    focus: {
        group: {
            defaultFocusId: "bottomButton"
        }
    }
}
```

### Card with Native Focus and Long Press

```brightscript
{
    id: "videoCard",
    nodeType: "Poster",
    focus: {
        enableNativeFocus: true,
        enableSpatialNavigation: false,
        onFocusChanged: sub(isFocused)
            if isFocused
                m.node.opacity = 1.0
            else
                m.node.opacity = 0.7
            end if
        end sub,
        onFocus: sub()
            m.getViewModel().dispatchFocusedCard()
        end sub,
        longPressHandler: sub(isLongPress as boolean, key as string)
            if isLongPress
                ' Start smooth scrolling
                m.getViewModel().startSmoothScroll()
                return true ' Indicate handled
            else
                ' Stop smooth scrolling
                m.getViewModel().stopSmoothScroll()
                return false
            end if
        end sub
    }
}
```

### Static Navigation with Dynamic Function

```brightscript
{
    id: "dynamicButton",
    nodeType: "Rectangle",
    focus: {
        up: function() as string
            if m.props.isInSpecialMode
                return "specialModeButton"
            else
                return "normalButton"
            end if
        end function,
        onSelect: sub()
            m.getViewModel().handleSelection()
        end sub
    }
}
```

### Hierarchical Group with Spatial Enter

```brightscript
{
    id: "contentGrid",
    nodeType: "Group",
    focus: {
        group: {
            defaultFocusId: "centerItem",
            enableSpatialEnter: true, ' Use spatial nav when entering from direction
            left: "sidebar", ' Exit to sidebar group
            onFocusChanged: sub(isFocused)
                m.getViewModel().updateGridState(isFocused)
            end sub
        }
    },
    children: [
        {
            id: "item1",
            focus: { onSelect: sub()
                m.getViewModel().selectItem(1)
            end sub }
        },
        {
            id: "centerItem",
            focus: { onSelect: sub()
                m.getViewModel().selectItem(2)
            end sub }
        },
        {
            id: "item3",
            focus: { onSelect: sub()
                m.getViewModel().selectItem(3)
            end sub }
        }
    ]
}
```

### Programmatic Focus Control

```brightscript
{
    id: "controlButton",
    nodeType: "Rectangle",
    focus: {
        onSelect: sub()
            ' Set focus to specific widget
            m.setFocus("targetWidget")

            ' Disable navigation during animation
            m.enableFocusNavigation(false)

            ' Re-enable after animation
            m.animateTransition(sub()
                m.enableFocusNavigation(true)
            end sub)
        end sub
    }
}
```

## Best Practices

### 1. Always Handle Focus State Visually

**Good**: Provide clear visual feedback using `onFocusChanged`:
```brightscript
focus: {
    onFocusChanged: sub(isFocused as boolean)
        if isFocused
            m.node.blendColor = "0xFF0000FF"
            m.node.opacity = 1.0
        else
            m.node.blendColor = "0xFFFFFFFF"
            m.node.opacity = 0.7
        end if
    end sub
}
```

**Avoid**: Relying solely on automatic state without visual feedback:
```brightscript
focus: {
    onSelect: sub()
        ' Visual feedback missing - user can't tell what's focused
        m.handleSelection()
    end sub
}
```

### 2. Organize Focus Groups Logically

**Good**: Structure groups based on UI layout and navigation flow:
```brightscript
{
    id: "mainContent",
    focus: {
        group: {
            defaultFocusId: "primaryButton",
            left: "sidebar",
            right: "detailsPanel"
        }
    }
}
```

**Avoid**: Flat structure without groups for complex UIs:
```brightscript
' All buttons at root level - hard to manage navigation
' Spatial navigation alone is insufficient for complex layouts
```

### 3. Use Explicit Directions for Critical Navigation

**Good**: Define explicit navigation paths for important flows:
```brightscript
focus: {
    enableSpatialNavigation: false,
    up: "headerButton",
    down: "footerButton",
    left: "sidebarMenu",
    right: "contentArea"
}
```

**Avoid**: Relying solely on spatial navigation for critical UI:
```brightscript
focus: {
    enableSpatialNavigation: true
    ' Spatial alone may produce unexpected navigation
}
```

### 4. Always Specify defaultFocusId for Groups

**Good**: Always provide default focus target:
```brightscript
focus: {
    group: {
        defaultFocusId: "firstItem", ' Clear entry point
        down: "nextGroup"
    }
}
```

**Avoid**: Group without default focus:
```brightscript
focus: {
    group: {
        ' Missing defaultFocusId - focus may be lost
        down: "nextGroup"
    }
}
```

## Navigation Rules

In CTV applications, focus is a critically important feature. In many cases, implementing complex focus behavior in dynamic, complex applications is very challenging. Therefore, the goal is a dynamic (runtime-adaptive) and intuitive, easy-to-use architecture. The rules below serve this goal.

### RULE #1: Widget Types

- `focus: { group: {...} }` → Group (container)
- `focus: {...}` (no group key) → FocusItem (focusable element)
- No focus config → Not part of focus system

### RULE #2: FocusItem Direction Values

- **String (Node ID)**: Static navigation to that element
- **Function**: Dynamic, evaluated at runtime (returns node ID or boolean)
- **`false`**: Blocks the direction (nothing happens)
- **`true`** / **`undefined`** / **`""`**: Spatial navigation attempts

### RULE #3: Navigation Priority (Decreasing Order)

1. FocusItem static direction (e.g., `left: "button2"`)
2. Spatial navigation (within group only)
3. BubblingFocus (ask parent groups)

### RULE #4: Spatial Navigation Scope

- **ONLY works within a single group**
- Cannot cross into sibling or parent groups
- Searches only possible focus items from `group.getGroupMembersHIDs()`

### RULE #5: Group Direction Activation

Group direction triggers ONLY when:
- FocusItem has NO static direction
- Spatial navigation found NOTHING
- BubblingFocus reaches this group

### RULE #6: Group Direction Values

- **String (Node ID)**: Navigate to that group/item (may EXIT group)
- **`true`**: BLOCKS (stays on current element)
- **`false`** / **`undefined`**: Continue bubbling to next ancestor

### RULE #7: Group Direction Does NOT Block Spatial Navigation

Setting `group.right = true` does NOT prevent spatial navigation INSIDE the group. It only blocks EXITING the group when spatial navigation finds nothing.

### RULE #8: Exiting a Group - 3 Methods

**Method 1: FocusItem explicit direction**
```brightscript
focusItem.right = "otherGroupItem" ' EXITS immediately
```

**Method 2: Group direction (via BubblingFocus)**
```brightscript
group.right = "otherGroup" ' EXITS when spatial nav fails
```

**Method 3: Ancestor group direction**
```brightscript
parentGroup.right = "otherGroup" ' EXITS when child groups pass
```

### RULE #9: Blocking Group Exit

To prevent exit: `group.left = true`, `group.right = true`

The plugin treats this as a valid navigation action that was processed - the user stays on the current item without the key event propagating further.

**Exception**: FocusItem explicit directions still work!

### RULE #10: BubblingFocus Flow

```
FocusItem (no direction) → Spatial nav (nothing) → Group.direction?
  - "nodeId" → CapturingFocus(nodeId) [EXIT]
  - true → STOP (stay on current)
  - false/undefined → Continue to parent group
  - No more ancestors → Stay on current
```

### RULE #11: CapturingFocus Priority

1. `group.lastFocusedHID` (if exists) [AUTO-SAVED]
2. `group.defaultFocusId` [CONFIGURED]
3. Deep search (if defaultFocusId not found immediately)

### RULE #12: DefaultFocusId Targets

- **FocusItem node ID** → Focus goes directly to it
- **Group node ID** → Capturing continues on that group
- **Non-existent ID** → Deep search attempts

### RULE #13: Deep Search Activation

Triggers when:
- CapturingFocus doesn't find `defaultFocusId` in immediate children
- `defaultFocusId` is not empty

Searches:
1. All descendant FocusItems (any depth)
2. All nested Groups (any depth, applies their fallback)

### RULE #14: Spatial Enter

When `enableSpatialEnter = true` on a group:
- Entering the group uses spatial navigation from the direction
- Finds geometrically closest item instead of `defaultFocusId`
- Falls back to `defaultFocusId` if spatial finds nothing

### RULE #15: Navigation Decision Tree Summary

```
User presses direction key:
  1. FocusItem.direction exists? → Use it (may EXIT group)
  2. Spatial nav finds item? → Navigate (STAYS in group)
  3. BubblingFocus: Group.direction?
     - "nodeId" → EXIT to that target
     - true → BLOCK (stay)
     - undefined → Continue to ancestor
  4. No more ancestors? → STAY on current item
```

## Common Pitfalls

1. **Focus Loops**: Circular navigation references between widgets
   - Solution: Use `false` to block directions or carefully plan navigation paths

2. **Missing Default Focus**: Group without `defaultFocusId` causes focus loss
   - Solution: Always specify `defaultFocusId` for groups (see RULE #11)

3. **Disabled Items**: Attempting to focus `isEnabled: false` items
   - Solution: Check `isEnabled` before programmatic focus or provide visual disabled state

4. **Native Focus Conflicts**: Mixing native SceneGraph focus with plugin focus
   - Solution: Use `enableNativeFocus` consistently; avoid mixing patterns

5. **Group Hierarchy Issues**: Improper parent-child relationships
   - Solution: Ensure groups properly contain focus items in widget tree structure

6. **Spatial Navigation Scope Misunderstanding**: Expecting spatial nav to work across groups
   - Solution: Spatial navigation only works within a single group (RULE #4); use static directions to exit groups

7. **Blocking Misunderstanding**: Setting `group.right = true` and expecting it to block internal spatial navigation
   - Solution: Group direction only blocks EXIT, not internal navigation (RULE #7)

8. **Deep defaultFocusId Not Found**: Using `defaultFocusId` that doesn't exist
   - Solution: Deep search will find it at any depth (RULE #13), but verify ID exists in hierarchy

## Troubleshooting

### Focus Not Responding to Key Presses

```brightscript
' Check if focus navigation is enabled
sub debugFocusNavigation()
    widget = m.getWidget("myButton")
    if widget.isFocusNavigationEnabled() = false
        print "Focus navigation is disabled globally"
        widget.enableFocusNavigation(true)
    end if

    ' Check if item is enabled
    if widget.focus.isEnabled = false
        print "Widget focus is disabled"
    end if

    ' Check current focused widget
    focused = widget.getFocusedWidget()
    if focused <> invalid
        print "Currently focused: " + focused.id
    else
        print "No widget has focus - set initial focus"
    end if
end sub
```

### Group Navigation Not Working

- **Check `defaultFocusId`**: Ensure it matches an existing focus item ID within the group (RULE #12)
- **Verify group hierarchy**: Confirm focus items are children of the group widget
- **Test group direction values**: Use `false` to block, string ID to navigate, `true` to stay (RULE #6)
- **Check bubbling flow**: Ensure parent groups have proper direction configuration (RULE #10)
- **Validate spatial enter**: If `enableSpatialEnter: true`, verify items have valid positions (RULE #14)
- **Check deep search**: If `defaultFocusId` is nested deeply, verify it exists in hierarchy (RULE #13)

### Focus State Not Updating UI

- **Verify callback setup**: Ensure `onFocusChanged` is properly defined
- **Check `viewModelState` access**: Confirm `m.viewModelState.isFocused` is being read correctly
- **Test field expressions**: If using field functions, ensure they reference `m.viewModelState.isFocused`
- **Debug with print statements**: Add logging to `onFocusChanged` to trace state changes
- **Inspect node field**: Check `m.node.isFocused` field value directly

### Unexpected Group Exit Behavior

- **Review RULE #8**: Understand the 3 methods for exiting a group
- **Check FocusItem explicit directions**: These override group directions (RULE #9 exception)
- **Verify group blocking**: Use `group.direction = true` to prevent exit (RULE #6)
- **Test bubbling**: Trace through RULE #10 flow to see where navigation resolves
- **Check navigation priority**: Review RULE #3 to understand resolution order

---

## 📚 Learn More

**NEXT STEP: [Internationalization support](./i18n-support.md)**

**Reference Documentation:**
- [Framework Initialization](./framework-initialization.md) - Configuration, task synchronization, and lifecycle
- [ViewBuilder Overview](./view-builder-overview.md) - High-level architecture and concepts
- [Widget Reference](./view-builder-widget-reference.md) - Complete Widget properties, methods, and usage patterns
- [ViewModel Reference](./view-builder-viewmodel-reference.md) - Complete ViewModel structure, lifecycle, and state management

**Plugin Documentation:**
- [Fields Plugin](./view-builder-fields-plugin.md) - Field management with expressions and interpolation
- [FontStyle Plugin](./view-builder-fontstyle-plugin.md) - Typography and font styling
- [Observer Plugin](./view-builder-observer-plugin.md) - Field observation patterns

**Additional Documentation:**
- [Cross-Thread MVI design pattern](./cross-thread-mvi.md) - State management across threads
- [Internationalization support](./i18n-support.md) - Locale-aware interface implementation
