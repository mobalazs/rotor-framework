# Focus Plugin

[← README.md](../README.md#-learn-more) | [🌱](./ai/view-builder-focus-plugin.opt.yaml)

## Introduction

The **Focus Plugin** is one of the most powerful and feature-rich components of the Rotor Framework. It provides a comprehensive, production-grade focus management system designed specifically for the unique challenges of Connected TV (CTV) application development.

In CTV environments, focus management is not a secondary concern — it is the primary input mechanism. Unlike web or mobile applications where users interact through touch or mouse, CTV applications rely entirely on directional remote control navigation. This makes focus management a critical architectural concern that affects every aspect of the user experience.

The Focus Plugin was developed over multiple years across several proof-of-concept and white-label production projects, evolving from basic navigation handling into a sophisticated, runtime-adaptive system that handles even the most complex UI layouts with minimal configuration. Its design prioritizes **developer experience** and **productivity**: common patterns require just a few lines of configuration, while advanced scenarios are supported through composable features rather than complex workarounds.

### Key Capabilities

- **Hierarchical Focus Groups** with bubbling and capturing resolution strategies, inspired by the DOM event model
- **Automatic Spatial Navigation** based on real-time widget geometry calculations, supporting both standard and rotated elements
- **Static and Dynamic Direction Overrides** with support for functions evaluated at navigation time
- **Focus Memory** that automatically remembers and restores the last focused item per group, with configurable depth
- **Long-Press Detection** with duration-based timer and handler callbacks for continuous scroll or special actions
- **Automatic State Management** through `viewModelState.isFocused` — no manual state wiring required
- **Programmatic Focus Control** via injected widget methods (`setFocus`, `triggerKeyPress`, `enableFocusNavigation`)
- **Deep Search Resolution** that finds focus targets at any depth in the widget hierarchy
- **Spatial Enter** for geometry-aware group entry from specific directions
- **Per-Direction Configuration** for fine-grained control over spatial enter behavior
- **Native Focus Bridge** for integrating with SceneGraph's native focus system when needed
- **Disabled Item Handling** that prevents focus on inactive elements while maintaining navigation flow

The system is built on two complementary resolution strategies — **bubbling** (upward search through ancestor groups) and **capturing** (downward resolution to concrete focus items) — that together handle navigation seamlessly across deeply nested, dynamic UI hierarchies.

---

## Template Configuration Keys

The Focus Plugin uses **two separate template keys** to distinguish between focusable items and focus containers:

| Template Key | Widget Role | Description |
|-------------|-------------|-------------|
| `focus: { ... }` | **FocusItem** | Individual focusable widget (button, card, menu entry, input field) |
| `focusGroup: { ... }` | **FocusGroup** | Container that manages navigation between child items and/or nested groups |

A widget **cannot** have both `focus` and `focusGroup` on the same template node. The plugin validates this at mount time and logs an error if both are present.

```brightscript
' FocusItem — receives focus directly
{
    id: "submitButton",
    nodeType: "Rectangle",
    focus: {
        onSelect: sub()
            m.getViewModel().handleSubmit()
        end sub
    }
}

' FocusGroup — manages child focus items
{
    id: "formContainer",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "emailInput",
        down: "footerBar"
    }
}
```

---

## Core Concepts

### Bubbling vs Capturing

The Focus Plugin implements two complementary focus resolution strategies:

#### 1. Bubbling Focus — "Upward Search"

**When**: User interaction (key press) cannot find a target within the current scope
**Direction**: Child → Parent → Grandparent (upward through ancestor groups)
**Purpose**: "I can't navigate further, let my parent groups decide"

Example: User presses UP from a focused item, but there's no item above in the current group. The plugin "bubbles up" through ancestor groups to find an alternative navigation path defined at a higher level.

#### 2. Capturing Focus — "Downward Resolution"

**When**: A group or abstract target ID needs to be resolved to a concrete focusable item
**Direction**: Group → Nested Group → FocusItem (downward through descendants)
**Purpose**: "Found a target group/ID, now find the actual focusable item inside it"

This is a resolution operation that converts:
- Group reference → concrete FocusItem
- ID string → actual widget with focus capability

Example: Bubbling found "sidebarGroup", but the system needs a specific focusable item. Capturing recursively descends through the group's `defaultFocusId` chain until it finds a real FocusItem.

#### Deep Search Enhancement

The capturing process searches deeply in hierarchies. If `defaultFocusId` doesn't match immediate children, it will:
- Search all descendant FocusItems (any depth)
- Search all nested Groups (any depth)
- Apply fallback logic if a matching Group is found

This means `defaultFocusId: "deepItem"` will find `"deepItem"` even if it's 3+ levels deep in the hierarchy.

**Together they work as**: User Action → Bubbling (↑ find alternative) → Capturing (↓ resolve target)

---

## FocusItem Configuration Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isEnabled` | boolean | `true` | Enable/disable focus capability. Disabled items are skipped by both manual and spatial navigation. |
| `enableNativeFocus` | boolean | `false` | When true, sets native SceneGraph focus on the underlying node (needed for keyboard input, video players, etc.) |
| `enableSpatialNavigation` | boolean | `false` | Opt-in to automatic geometry-based navigation within the parent group |
| `autoSetIsFocusedState` | boolean | `true` | When true, automatically manages `viewModelState.isFocused` and `node.isFocused`. Set to false for custom state handling. |
| `up` / `down` / `left` / `right` / `back` | string \| function \| boolean | `""` | Static or dynamic navigation direction (see Direction Values) |
| `onFocusChanged` | `sub(isFocused as boolean)` | `invalid` | Called when focus state changes (receives true on focus, false on blur) |
| `onFocus` | `sub()` | `invalid` | Called when the widget gains focus |
| `onBlur` | `sub()` | `invalid` | Called when the widget loses focus |
| `onSelect` | `sub()` | `invalid` | Called when the OK button is pressed while the widget is focused |
| `longPressHandler` | `function(isLongPress as boolean, key as string) as boolean` | `invalid` | Handle long-press events. Return `true` if handled (stops bubbling to ancestor groups). |

## FocusGroup Configuration Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `defaultFocusId` | string \| `function() as string` | `""` | Default focus target when the group receives focus. Can be a static node ID or a function evaluated at resolution time. |
| `lastFocusedHID` | string | `""` (auto-managed) | Automatically remembers the last focused item's HID within this group |
| `enableLastFocusId` | boolean | `true` | When true, the immediate parent group stores `lastFocusedHID` for direct children |
| `enableDeepLastFocusId` | boolean | `false` | When true, ancestor groups also store `lastFocusedHID` from ANY descendant depth |
| `enableSpatialEnter` | boolean \| object | `false` | Enable spatial navigation when entering the group from a direction. Can be a boolean (all directions) or per-direction AA: `{ right: true, down: true }` |
| `autoSetIsFocusedState` | boolean | `true` | When true, automatically manages `viewModelState.isFocused` for the group based on its focus chain state |
| `up` / `down` / `left` / `right` / `back` | string \| function \| boolean | `""` | Group-level navigation directions (activated via bubbling) |
| `onFocusChanged` | `sub(isFocused as boolean)` | `invalid` | Called when the group's focus chain state changes (true = a descendant has focus) |
| `onFocus` | `sub()` | `invalid` | Called when a descendant gains focus (group enters focus chain) |
| `onBlur` | `sub()` | `invalid` | Called when all descendants lose focus (group leaves focus chain) |
| `longPressHandler` | `function(isLongPress as boolean, key as string) as boolean` | `invalid` | Handle long-press events at group level. Return `true` to stop propagation. |

---

## Direction Values Reference

Direction properties (`up`, `down`, `left`, `right`, `back`) accept different value types with distinct behaviors:

### On FocusItem

| Value | Behavior |
|-------|----------|
| `"nodeId"` (string) | Static navigation to that widget — **exits group immediately** |
| `function() as string` | Dynamic, evaluated at runtime — return a node ID or boolean |
| `false` | **Blocks** the direction (nothing happens, key is consumed) |
| `true` / `""` / undefined | Falls through to spatial navigation |

### On FocusGroup

| Value | Behavior |
|-------|----------|
| `"nodeId"` (string) | Navigate to that group/item — **may exit group** |
| `function() as string` | Dynamic, evaluated at runtime |
| `true` | **Blocks exit** (stays on current element, key is consumed) |
| `false` / `""` / undefined | Continue bubbling to next ancestor group |

---

## Lifecycle Integration

| Lifecycle Hook | Purpose |
|----------------|---------|
| `beforeMount` | Register focus item or group when widget mounts |
| `beforeUpdate` | Remove old focus config, merge new config, re-register |
| `beforeDestroy` | Unregister focus item/group, clear global focus if this widget held it |

### Focus Processing Pipeline

1. **Configuration Parse** — Plugin determines if the widget is a FocusItem (`focus:`) or FocusGroup (`focusGroup:`)
2. **Instance Creation** — Creates `FocusItemClass` or `GroupClass` instance with configuration
3. **Registration** — Stores instance in `FocusItemStack` or `GroupStack`
4. **Hierarchy Tracking** — Ancestor group relationships are computed dynamically via HID matching
5. **State Initialization** — Sets `viewModelState.isFocused = false` and adds `node.isFocused` field automatically
6. **Focus Application** — When focus is set, calls `onFocusChanged`, `onFocus`/`onBlur` callbacks
7. **State Update** — Updates `viewModelState.isFocused` and `node.isFocused` field on both items and ancestor groups
8. **Navigation Handling** — Processes key events through static → spatial → bubbling priority chain
9. **Group Notification** — Notifies all affected ancestor groups of focus chain changes
10. **Cleanup** — Removes focus config and destroys instances on widget destroy

---

## Injected Widget Methods

Widgets with focus configuration automatically receive these methods:

| Method | Signature | Description |
|--------|-----------|-------------|
| `setFocus` | `function(command, enableNativeFocus?) as boolean` | Focus current widget (`true`), blur it (`false`), or focus another widget by ID (string). Returns `true` if focus changed. |
| `getFocusedWidget` | `function() as object` | Returns the currently focused widget instance across the entire focus system |
| `enableFocusNavigation` | `sub(enabled = true)` | Globally enable/disable all focus navigation (useful during animations or transitions) |
| `isFocusNavigationEnabled` | `function() as boolean` | Check if focus navigation is currently enabled |
| `proceedLongPress` | `function() as object` | Manually trigger the navigation action for the currently held long-press key |
| `isLongPressActive` | `function() as boolean` | Check if a long-press is currently active |
| `triggerKeyPress` | `function(key) as object` | Simulate a key press programmatically (for testing or automated navigation) |
| `setGroupLastFocusedId` | `sub(id)` | Manually update the `lastFocusedHID` of this widget's focus group. If called on a FocusItem, updates the parent group. |

---

## Patterns and Real-World Examples

### Basic Focusable Button

The simplest focus configuration — a button with visual feedback and selection handling:

```brightscript
{
    id: "primaryAction",
    nodeType: "Rectangle",
    focus: {
        onFocusChanged: sub(isFocused as boolean)
            if isFocused
                m.node.blendColor = "0x3399FFFF"
                m.node.opacity = 1.0
            else
                m.node.blendColor = "0xFFFFFFFF"
                m.node.opacity = 0.8
            end if
            ' Note: m.viewModelState.isFocused is updated automatically
        end sub,
        onSelect: sub()
            m.getViewModel().handleAction()
        end sub
    }
}
```

### Form with Spatial Navigation

A linear form where spatial navigation handles movement between fields automatically:

```brightscript
{
    id: "loginForm",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "emailInput"
    },
    children: [
        {
            id: "emailInput",
            viewModel: ViewModels.TextInputField,
            focus: {
                enableSpatialNavigation: true,
                onSelect: sub()
                    m.openKeyboard("email")
                end sub
            }
        },
        {
            id: "passwordInput",
            viewModel: ViewModels.TextInputField,
            focus: {
                enableSpatialNavigation: true,
                onSelect: sub()
                    m.openKeyboard("password")
                end sub
            }
        },
        {
            id: "loginButton",
            viewModel: ViewModels.ActionButton,
            focus: {
                enableSpatialNavigation: true,
                onSelect: sub()
                    m.submitCredentials()
                end sub
            }
        }
    ]
}
```

After a keyboard dialog closes, focus can be moved programmatically:

```brightscript
sub onKeyboardClosed(fieldName as string)
    if fieldName = "email"
        m.setFocus("passwordInput")
    else if fieldName = "password"
        m.setFocus("loginButton")
    end if
end sub
```

### Sidebar + Content Layout with Bidirectional Navigation

A classic CTV layout with a left-side menu and right-side content area:

```brightscript
' Main layout group
{
    id: "appLayout",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: function() as string
            return m.viewModelState.wasContentFocused ? "contentArea" : "sideMenu"
        end function,
        onBlur: sub()
            m.viewModelState.wasContentFocused = m.children?.contentArea?.viewModelState?.isFocused = true
        end sub
    },
    children: [
        ' Sidebar menu
        {
            id: "sideMenu",
            nodeType: "Group",
            focusGroup: {
                defaultFocusId: "menuHome",
                right: "contentArea",
                back: "contentArea"
            },
            children: [
                {
                    id: "menuHome",
                    focus: {
                        onFocus: sub()
                            m.activateSection("home")
                        end sub
                    }
                },
                {
                    id: "menuSearch",
                    focus: {
                        onFocus: sub()
                            m.activateSection("search")
                        end sub
                    }
                },
                {
                    id: "menuSettings",
                    focus: {
                        onFocus: sub()
                            m.activateSection("settings")
                        end sub
                    }
                }
            ]
        },
        ' Content area
        {
            id: "contentArea",
            nodeType: "Group",
            focusGroup: {
                defaultFocusId: function() as string
                    return m.viewModelState.activePageId
                end function,
                left: "sideMenu",
                back: "sideMenu"
            }
        }
    ]
}
```

Key techniques demonstrated:
- **Dynamic `defaultFocusId`** functions that resolve at focus time based on current state
- **Focus restoration** — the parent group remembers whether content or menu was focused via `onBlur`
- **Menu items use `onFocus`** (not `onSelect`) to trigger content changes passively during navigation

### Horizontal Carousel with Long-Press Scrolling

A scrollable card carousel that supports continuous scrolling via long-press:

```brightscript
{
    id: "movieCarousel",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: function()
            return m.getCurrentCardId()
        end function,
        left: function()
            return m.scrollToPreviousCard()  ' Returns card ID or false
        end function,
        right: function()
            return m.scrollToNextCard()       ' Returns card ID or false
        end function,
        longPressHandler: function(isLongPress, key) as boolean
            if key = "left" or key = "right"
                direction = key = "left" ? -1 : 1
                m.handleContinuousScroll(isLongPress, direction)
            end if
            return false  ' Don't consume — let ancestors handle too
        end function,
        onFocusChanged: sub(isFocused)
            if isFocused
                m.showScrollIndicators()
            else
                m.hideScrollIndicators()
            end if
        end sub,
        onBlur: sub()
            m.pauseBackgroundPreview()
        end sub
    }
}
```

Key techniques demonstrated:
- **Direction functions** that return a card ID (to navigate) or `false` (to block at boundaries)
- **Long-press handler** — `isLongPress = true` starts continuous scroll, `isLongPress = false` stops it
- **Returning `false`** from `longPressHandler` allows the event to bubble to ancestor groups
- **`onBlur`** to clean up state when focus leaves the carousel

### Vertical Rail Carousel with Expand/Collapse

A vertical list of rails that expands the focused rail and collapses others:

```brightscript
{
    id: "railList",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: function()
            return m.getActiveRailId()
        end function,
        up: function()
            return m.navigateToRail(-1)
        end function,
        down: function()
            return m.navigateToRail(1)
        end function,
        onFocus: sub()
            m.expandActiveRail()
        end sub,
        onBlur: sub()
            m.collapseAllRails()
        end sub
    }
}
```

### Card with Focus Event Dispatch

A card that dispatches its metadata when focused, enabling parent components to update:

```brightscript
{
    id: "contentCard",
    nodeType: "Poster",
    focus: {
        enableNativeFocus: false,
        onFocusChanged: sub(isFocused)
            m.updateVisualState(isFocused)
        end sub,
        onFocus: sub()
            m.dispatchCardMetadata()  ' Dispatches title, image, etc. to parent
        end sub,
        onSelect: sub()
            m.openDetailPage()
        end sub
    }
}
```

### Modal Dialog (Focus Trap)

A modal that captures all focus — no direction key can exit:

```brightscript
{
    id: "confirmDialog",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "confirmButton",
        left: true,    ' Block all directions
        right: true,
        up: true,
        down: true,
        back: true     ' Block back button too
    },
    children: [
        {
            id: "confirmButton",
            focus: {
                onSelect: sub()
                    m.handleConfirm()
                end sub
            }
        },
        {
            id: "cancelButton",
            focus: {
                onSelect: sub()
                    m.handleCancel()
                end sub
            }
        }
    ]
}
```

### Nested Groups with Bubbling

Inner group has no down-direction, so navigation bubbles to the parent group:

```brightscript
{
    id: "pageLayout",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "categoryList",
        down: "footerBar"          ' Catches bubbling from inner groups
    },
    children: [
        {
            id: "categoryList",
            nodeType: "Group",
            focusGroup: {
                defaultFocusId: "category1"
                ' No "down" direction → bubbles to pageLayout
            },
            children: [
                { id: "category1", focus: { onSelect: sub() ... end sub } },
                { id: "category2", focus: { onSelect: sub() ... end sub } }
            ]
        }
    ]
}

{
    id: "footerBar",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "footerAction1"
    }
}
```

### Settings Page with `setGroupLastFocusedId`

A settings page where left-side menu and right-side panels stay synchronized:

```brightscript
' Settings page layout
{
    id: "settingsLayout",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "optionsMenu"
    },
    children: [
        {
            id: "optionsMenu",
            nodeType: "Group",
            focusGroup: {
                defaultFocusId: "menuItem_general",
                right: "settingsPanel"
            }
        },
        {
            id: "settingsPanel",
            nodeType: "Group",
            focusGroup: {
                left: "optionsMenu"
            }
        }
    ]
}
```

When the panel carousel scrolls to a new section, the menu selection must update:

```brightscript
sub onPanelChanged(sectionIndex as integer)
    menuItem = m.menuItems[sectionIndex]
    m.children.optionsMenu.setGroupLastFocusedId("menuItem_" + menuItem.id)
end sub
```

This ensures that pressing LEFT from the panel focuses the correct menu item — not the first item, but the one matching the current panel.

### Conditional Focus Behavior (onFocus vs onSelect)

Menu items where regular entries trigger on focus (passive navigation), but action entries only trigger on OK press:

```brightscript
for each entry in m.menuEntries
    itemConfig = {
        id: "entry_" + entry.id,
        viewModel: ViewModels.MenuItem
    }

    if entry.isAction
        ' Action items require explicit confirmation
        itemConfig.focus = {
            onSelect: sub()
                m.executeAction(m.props.actionType)
            end sub
        }
    else
        ' Navigation items activate on focus
        itemConfig.focus = {
            onFocus: sub()
                m.showSection(m.props.sectionId)
            end sub
        }
    end if

    children.push(itemConfig)
end for
```

### Dynamic Direction Functions

A button whose navigation changes based on application state:

```brightscript
{
    id: "adaptiveButton",
    nodeType: "Rectangle",
    focus: {
        up: function() as string
            if m.viewModelState.isExpanded
                return "expandedHeader"
            else
                return "collapsedHeader"
            end if
        end function,
        right: function() as string
            if m.props.hasDetailPanel
                return "detailPanel"
            end if
            return ""  ' Fall through to spatial navigation
        end function
    }
}
```

### Spatial Enter for Geometry-Aware Group Entry

A content grid that focuses the geometrically closest item when entering from a direction:

```brightscript
{
    id: "contentGrid",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "gridItem_0",
        enableSpatialEnter: true,      ' Use closest item when entering from any direction
        left: "navigationMenu"
    },
    children: gridItems
}
```

Per-direction spatial enter — only use spatial entry from the right, but default entry from other directions:

```brightscript
{
    id: "categoryGrid",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "item_0",
        enableSpatialEnter: {
            right: true,   ' Spatial entry from right
            down: true     ' Spatial entry from below
        }
    }
}
```

### Deep Focus Memory with `enableDeepLastFocusId`

A navigation hierarchy that remembers the last focused item at any depth:

```brightscript
{
    id: "mainNavigation",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "topicList",
        enableDeepLastFocusId: true,   ' Remember focus at ANY depth
        right: "detailPanel"
    },
    children: [
        {
            id: "topicList",
            nodeType: "Group",
            focusGroup: { defaultFocusId: "topic1" },
            children: [
                {
                    id: "topic1",
                    nodeType: "Group",
                    focusGroup: { defaultFocusId: "subtopic1_1" },
                    children: [
                        { id: "subtopic1_1", focus: {} },
                        { id: "subtopic1_2", focus: {} },
                        { id: "subtopic1_3", focus: {} }
                    ]
                }
            ]
        }
    ]
}
```

When the user focuses `subtopic1_3`, navigates RIGHT to `detailPanel`, then returns LEFT — focus goes directly back to `subtopic1_3` (not to `topicList` or `topic1` defaults) because `mainNavigation` has `enableDeepLastFocusId: true`.

### Disabling Focus Memory

A group that always returns to its default, ignoring previous focus history:

```brightscript
{
    id: "spotlightCarousel",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "spotlightFirst",
        enableLastFocusId: false   ' Always start from first item, never remember
    }
}
```

### Animated Focus Indicator

A panel with an animated vertical focus indicator bar:

```brightscript
{
    id: "preferencePanel",
    nodeType: "Group",
    focusGroup: {
        defaultFocusId: "firstToggle",
        onFocusChanged: sub(isFocused as boolean)
            indicator = m.getWidget("focusBar")
            anim = m.animator("focus-bar-anim")
            anim.create({
                target: indicator,
                opacity: isFocused ? 1 : 0,
                duration: 0.2,
                easeFunction: "linear"
            }).play()
        end sub
    },
    children: [
        {
            id: "focusBar",
            nodeType: "Rectangle",
            fields: { width: 4, height: 200, color: "0x3399FFFF", opacity: 0 }
        },
        ' ... toggle items
    ]
}
```

### Programmatic Focus Control During Transitions

Disable navigation during animations to prevent race conditions:

```brightscript
sub onTransitionStart()
    m.enableFocusNavigation(false)
end sub

sub onTransitionComplete()
    m.enableFocusNavigation(true)
    m.setFocus("firstItemInNewView")
end sub
```

### Disabled Widget (Non-Focusable)

A toggle that displays device state but cannot be interacted with:

```brightscript
{
    id: "readOnlyToggle",
    viewModel: ViewModels.ToggleButton,
    props: {
        label: "System Audio Guide",
        isOn: CreateObject("roDeviceInfo").IsAudioGuideEnabled(),
        enabled: false    ' Cannot receive focus
    },
    focus: {
        isEnabled: false  ' Plugin skips this during navigation
    }
}
```

---

## Navigation Rules

### RULE #1: Widget Types

- `focus: { ... }` → **FocusItem** (focusable element)
- `focusGroup: { ... }` → **FocusGroup** (container)
- No focus config → Not part of the focus system

### RULE #2: FocusItem Direction Values

- **String (Node ID)**: Static navigation to that element
- **Function**: Dynamic, evaluated at runtime (returns node ID or boolean)
- **`false`**: Blocks the direction (nothing happens)
- **`true`** / **`""`** / undefined: Falls through to spatial navigation

### RULE #3: Navigation Priority (Decreasing Order)

1. FocusItem static direction (e.g., `left: "actionButton"`)
2. Spatial navigation (within the parent group only)
3. BubblingFocus (ask ancestor groups)

### RULE #4: Spatial Navigation Scope

- **Only works within a single group** — cannot cross group boundaries
- Candidates include: FocusItems **and** direct child Groups with `enableSpatialNavigation: true`
- `enableSpatialNavigation` default is **`false`** (opt-in)
- When a Group is selected via spatial nav, capturing focus starts into that group

### RULE #5: Group Direction Activation

Group direction triggers **only** when:
- FocusItem has NO static direction for that key
- Spatial navigation found NOTHING
- BubblingFocus reaches this group

### RULE #6: Group Direction Values

- **String (Node ID)**: Navigate to that group/item — **may exit group**
- **`true`**: **Blocks exit** — stays on current element, key is consumed
- **`false`** / undefined: Continue bubbling to next ancestor group

### RULE #7: Group Direction Does NOT Block Internal Spatial Navigation

Setting `group.right = true` does NOT prevent spatial navigation **inside** the group. It only blocks **exiting** the group when spatial navigation finds nothing.

### RULE #8: Three Methods for Exiting a Group

**Method 1: FocusItem explicit direction**
```brightscript
' FocusItem exits immediately, regardless of group config
focus: { right: "targetOutsideGroup" }
```

**Method 2: Group direction (via BubblingFocus)**
```brightscript
' Group exits when spatial nav fails inside it
focusGroup: { right: "adjacentGroup" }
```

**Method 3: Ancestor group direction**
```brightscript
' Parent group catches bubbling when child groups pass
focusGroup: { right: "otherSection" }
```

### RULE #9: Blocking Group Exit

To prevent exit: `group.left = true`, `group.right = true`

**Exception**: FocusItem explicit directions **still work** — they bypass group blocking.

### RULE #10: BubblingFocus Flow

```
FocusItem (no direction) → Spatial nav (nothing) → Group.direction?
  → "nodeId" → CapturingFocus(nodeId) [EXIT]
  → true     → STOP (stay on current element)
  → false/undefined → Continue to parent group
  → No more ancestors → Stay on current item
```

### RULE #11: CapturingFocus Priority

1. `group.lastFocusedHID` (if exists and still valid) [AUTO-SAVED]
2. `group.defaultFocusId` [CONFIGURED]
3. Deep search (if defaultFocusId not found in immediate children)

### RULE #11b: Focus Memory Configuration

- **`enableLastFocusId`** (default: `true`) — Controls whether the **immediate parent** group stores `lastFocusedHID`
- **`enableDeepLastFocusId`** (default: `false`) — When true, **ancestor groups** also store `lastFocusedHID` from ANY descendant depth

Use case: In nested groups (e.g., `mainMenu > subMenu > menuItem`), if you want the outer `mainMenu` to remember which deeply nested `menuItem` was last focused, set `enableDeepLastFocusId: true` on `mainMenu`.

### RULE #12: DefaultFocusId Targets

- **FocusItem node ID** → Focus goes directly to it
- **Group node ID** → Capturing continues recursively on that group
- **Non-existent ID** → Deep search attempts across all descendants

### RULE #13: Deep Search Activation

Triggers when:
- CapturingFocus doesn't find `defaultFocusId` in immediate children
- `defaultFocusId` is not empty

Searches:
1. All descendant FocusItems (any depth)
2. All nested Groups (any depth, applies their fallback logic)

### RULE #14: Spatial Enter

When `enableSpatialEnter = true` (or `{ direction: true }`) on a group:
- Entering the group uses spatial navigation from the incoming direction
- Finds the geometrically closest item instead of `defaultFocusId`
- Falls back to `defaultFocusId` if spatial finds nothing
- **Ignores `lastFocusedHID`** — always uses spatial calculation

### RULE #15: Navigation Decision Tree Summary

```
User presses direction key:
  1. FocusItem.direction exists?  → Use it (may EXIT group)
  2. Spatial nav finds item?      → Navigate (STAYS in group)
  3. BubblingFocus: Group.direction?
     → "nodeId"   → EXIT to that target
     → true       → BLOCK (stay)
     → undefined  → Continue to ancestor
  4. No more ancestors?           → STAY on current item
```

---

## Best Practices

### 1. Always Provide Visual Focus Feedback

Every focusable item should clearly indicate when it holds focus. Use `onFocusChanged` for visual state changes:

```brightscript
focus: {
    onFocusChanged: sub(isFocused as boolean)
        m.node.blendColor = isFocused ? "0x3399FFFF" : "0xFFFFFFFF"
        m.node.opacity = isFocused ? 1.0 : 0.8
    end sub
}
```

Alternatively, use `viewModelState.isFocused` in field expressions for reactive updates without explicit callbacks.

### 2. Always Specify `defaultFocusId` for Groups

A group without `defaultFocusId` can cause focus loss when focus enters the group:

```brightscript
' Always provide an entry point
focusGroup: {
    defaultFocusId: "firstItem"
}
```

### 3. Use Groups to Organize Navigation Logically

Structure groups based on UI layout and user navigation expectations. Flat structures without groups make complex layouts difficult to manage.

### 4. Use Explicit Directions for Critical Navigation Paths

Spatial navigation is great for grids and lists, but critical cross-section navigation should use explicit directions:

```brightscript
focusGroup: {
    left: "sideMenu",       ' Predictable cross-section nav
    enableSpatialNavigation: false  ' Don't rely on geometry for this
}
```

### 5. Use `onFocus` for Passive Selection, `onSelect` for Active Confirmation

- **`onFocus`** — Trigger lightweight actions when the user navigates (preview content, highlight menu sections)
- **`onSelect`** — Trigger actions that require explicit user confirmation (submit form, open dialog, play video)

### 6. Disable Focus Navigation During Transitions

Prevent user navigation during animations or async transitions to avoid race conditions:

```brightscript
m.enableFocusNavigation(false)
' ... perform transition ...
m.enableFocusNavigation(true)
```

### 7. Use Dynamic Functions for Context-Dependent Navigation

When the navigation target depends on runtime state, use functions instead of static strings:

```brightscript
focusGroup: {
    defaultFocusId: function() as string
        return m.viewModelState.currentTabId
    end function
}
```

---

## Common Pitfalls

| Pitfall | Symptom | Solution |
|---------|---------|----------|
| **Focus Loops** | Focus cycles between two widgets endlessly | Use `false` to block directions or carefully plan navigation paths |
| **Missing `defaultFocusId`** | Focus is lost when entering a group | Always specify `defaultFocusId` (RULE #11) |
| **Focusing disabled items** | `setFocus` returns false, nothing happens | Check `isEnabled` before programmatic focus; provide visual disabled state |
| **Native focus conflicts** | Unexpected focus jumps or lost input | Use `enableNativeFocus` consistently; avoid mixing native and plugin focus |
| **Group hierarchy issues** | Navigation doesn't work as expected | Ensure groups properly contain focus items in the widget tree |
| **Spatial scope misunderstanding** | Expecting spatial nav to cross groups | Spatial only works within one group (RULE #4); use static directions to exit |
| **Blocking misunderstanding** | `group.right = true` blocks internal spatial | It only blocks **exiting** — internal spatial nav still works (RULE #7) |
| **Both `focus` and `focusGroup`** | Widget is silently skipped | A widget must have one or the other, never both |
| **`enableSpatialNavigation` assumption** | Spatial nav doesn't work | Default is `false` — must opt in explicitly |

---

## Troubleshooting

### Focus Not Responding to Key Presses

```brightscript
' Check global navigation state
if m.isFocusNavigationEnabled() = false
    print "Focus navigation is disabled globally"
    m.enableFocusNavigation(true)
end if

' Check if any widget has focus
focused = m.getFocusedWidget()
if focused = invalid
    print "No widget has focus — set initial focus"
    m.setFocus("initialTarget")
end if

' Check if target widget is enabled
' (isEnabled: false prevents focus)
```

### Group Navigation Not Working

- Verify `defaultFocusId` matches an existing widget ID within the group (RULE #12)
- Confirm focus items are actual children (descendants) of the group in the widget tree
- Test direction values: `true` blocks, string navigates, `false`/undefined continues bubbling (RULE #6)
- Check bubbling flow through parent groups (RULE #10)
- If using `enableSpatialEnter`, verify items have valid positions

### Focus State Not Updating UI

- Verify `onFocusChanged` callback is properly defined
- Check that `m.viewModelState.isFocused` is being read (auto-managed by default)
- If `autoSetIsFocusedState: false`, you must manage state manually
- Inspect `m.node.isFocused` field value directly for debugging

### Unexpected Group Exit Behavior

- Review the three methods for exiting a group (RULE #8)
- FocusItem explicit directions **override** group blocking (RULE #9 exception)
- Check navigation priority: static → spatial → bubbling (RULE #3)

---

## Learn More

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
