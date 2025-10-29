# Widget Reference

[← README.md](../README.md#-learn-more) | [🌱](./ai/view-builder-widget-reference.opt.yaml)

## Overview

A **Widget** is the smallest unit in the Rotor UI tree. Every widget is a plain BrightScript object that describes a SceneGraph node and its behavior.

Every widget in the Rotor Framework automatically receives core configuration properties and methods. This document covers the fundamental widget functionality available to all widgets.

## Configuration Properties Reference

### Core Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | No | Unique widget identifier
| `nodeType` | string | No | SceneGraph node type (default: "Group") |
| `viewModel` | class | No | ViewModel class reference |
| `props` | object | No | Properties passed to ViewModels |
| `viewModelState` | object | No | Initial ViewModel state |
| `children` | array/object | No | Child widget configurations |
| `zIndex` | integer | No | Rendering z-order |

Notes:
* `id` is auto-generated if omitted, guaranteed unique among siblings.
* `nodeType` accepts both built-in SceneGraph node types (e.g., "Label", "Group") and custom component names.
* `zIndex` controls rendering order among node siblings - higher values render on top (default: order of creation).
* `props` and `viewModelState` are shared across all widgets within the same ViewModel. Reminder: Widgets are individual components as the smallest unit of the virtual widget tree; ViewModels group multiple widgets with shared state and props.

### Lifecycle Hooks

| Property | Description |
|----------|-------------|
| `onMountWidget` | Called when widget mounts to scene |
| `onUpdateWidget` | Called when widget configuration updates |
| `onDestroyWidget` | Called before widget destruction |
| `onRenderSettled` | Called after render completes |

### Internationalization

| Property | Description |
|----------|-------------|
| `i18n.path` | Single translation section path |
| `i18n.paths` | Multiple translation section paths |
| `i18n.includeIsRtl` | Include RTL flag in viewModelState |
| `i18n.includeLocale` | Include locale string in viewModelState |

## Injected Methods Reference

Every widget automatically receives these methods:

### Framework Access

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `getFrameworkInstance` | - | object | Framework instance |
| `getInfo` | - | object | Framework info (device, version) |

### Widget Navigation

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `getWidget` | `id` (string) | object | Find widget by ID (any depth) or path |
| `getSiblingWidget` | `id` (string) | object | Get direct sibling by ID |
| `getViewModel` | - | object | Get widget's ViewModel |
| `getParentViewModel` | - | object | Get parent ViewModel |
| `getRootWidget` | - | object | Get root widget |
| `findWidgets` | `pattern` (string) | array | Find widgets by pattern |
| `getChildrenWidgets` | `matchingPattern` (string, optional) | array | Get direct children, optionally filtered by ID pattern |
| `getSubtreeClone` | `pattern` (optional), `keyPaths` | object | Clone widget subtree (current widget if no pattern) |

### Rendering

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `render` | `payloads`, `params` | void | Render or update widgets |
| `refresh` | `keyPaths` | void | Refresh specific features |
| `erase` | `payloads`, `skipPool` | void | Destroy widgets |

### State Management

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `getDispatcher` | `id` (string) | object | Get dispatcher by ID |
| `createDispatcher` | `id`, `model`, `reducer` | object | Create new dispatcher |

### Animation

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `animator` | `id` (string) | object | Get animator factory |

## Basic Usage

### Simple Widget

```brightscript
{
    id: "simpleLabel",
    nodeType: "Label",
    fields: {
        text: "Hello World",
        color: "#FFFFFF"
    }
}
```

### Widget with Children

```brightscript
frameworkInstance.render({
    id: "container",
    nodeType: "Rectangle",
    fields: {
        width: 300,
        height: 100,
        translation: [100, 50],
        color: "#3E6641"
    },
    children: [{
        id: "label",
        nodeType: "Label",
        fields: {
            text: "Hello World",
            horizAlign: "center",
            vertAlign: "center",
            width: 300,
            height: 100,
            color: "#FFFFFF"
        }
    }]
})
```

### Widget with Lifecycle

```brightscript
{
    id: "lifecycleWidget",
    nodeType: "Group",
    fields: {
        visible: true
    },
    onMountWidget: sub()
        print "Widget mounted: " + m.id
    end sub,
    onDestroyWidget: sub()
        print "Widget destroyed: " + m.id
    end sub
}
```

### Widget with Children

```brightscript
{
    id: "container",
    nodeType: "Group",
    children: [
        {
            id: "title",
            nodeType: "Label",
            fields: {
                text: "Container Title"
            }
        },
        {
            id: "content",
            nodeType: "Group",
            children: [
                {
                    id: "item1",
                    nodeType: "Rectangle",
                    fields: { color: "#FF0000" }
                },
                {
                    id: "item2",
                    nodeType: "Rectangle",
                    fields: { color: "#00FF00" }
                }
            ]
        }
    ]
}
```

## Widget Navigation

### Direct Access

```brightscript
' Access by ID (searches recursively at any depth)
childWidget = m.getWidget("childId")  ' Finds childId anywhere in subtree

' Access by explicit path
nestedWidget = m.getWidget("container/content/item1")

' Access sibling (must be direct sibling, not recursive)
siblingWidget = m.getSiblingWidget("siblingId")

' Access parent
parentWidget = m.getWidget("../")  ' Using navigation
parentWidget = m.parent            ' Direct property access (alternative)

' Access children
allChildren = m.getChildrenWidgets()  ' Returns ordered array
childrenAA = m.children                ' Direct property access (associative array, unordered)
```

### Glob Pattern Matching

Use `findWidgets` for pattern-based widget search:

```brightscript
' Single wildcard (*) - matches one level
directChildren = m.findWidgets("container/*")
menuItems = m.findWidgets("menuItem*")

' Double wildcard (**) - matches any depth
allTitles = m.findWidgets("**/title")
allButtons = m.findWidgets("**/*Button")

' Path-based search
navWidget = m.findWidgets("app/header/nav")

' Pattern in path
navChildren = m.findWidgets("app/*/nav/*")

' Relative paths
parent = m.findWidgets("..")
sibling = m.findWidgets("../siblingId")
```

**Glob Pattern Syntax:**

| Pattern | Description | Example |
|---------|-------------|---------|
| `*` | Match any characters at one level | `item*` → item1, item2, itemFoo |
| `**` | Match any depth recursively | `**/footer` → all footer widgets |
| `/` | Path separator | `app/header/nav` |
| `..` | Parent directory | `..` → parent widget |
| `./` | Current directory (root) | `./app` → app from root |

### Get Direct Children

Use `getChildrenWidgets` to get direct children of the current widget, with optional ID pattern filtering:

```brightscript
' Get all children (no filtering)
allChildren = m.getChildrenWidgets()  ' Returns all children in node order

' Filter children by ID pattern (glob matching)
menuItems = m.getChildrenWidgets("menuItem*")  ' Returns: menuItem1, menuItem2, menuItem3
buttons = m.getChildrenWidgets("*Button")      ' Returns: saveButton, cancelButton
specificChild = m.getChildrenWidgets("header") ' Returns: [header] (exact match)

' Pattern with wildcards
items = m.getChildrenWidgets("item*")          ' Matches: item1, item2, itemFoo
controls = m.getChildrenWidgets("*Control")    ' Matches: textControl, buttonControl

' Empty widget returns empty array
leafChildren = m.getChildrenWidgets()  ' Returns: [] (no children)

' No matching children returns empty array
noMatch = m.getChildrenWidgets("nonExistent*")  ' Returns: []
```

**Direct Property Access (Alternative):**

```brightscript
' Access children as associative array (unordered)
childrenAA = m.children  ' { childId: widget, anotherChild: widget, ... }

' Access specific child directly
specificChild = m.children["childId"]  ' Direct access by ID
specificChild = m.children.childId     ' Dot notation (case-sensitive)
```

**Note**:
- `matchingPattern` is optional. If omitted, returns all children.
- Pattern matching uses glob syntax: `*` matches any characters
- `getChildrenWidgets()` returns **ordered** array (matching node order)
- `m.children` is an **unordered** associative array for direct access

### Hierarchy Access

```brightscript
' Get parent ViewModel
parentVM = m.getParentViewModel()

' Get own ViewModel
myVM = m.getViewModel()

' Get root widget
rootWidget = m.getRootWidget()
```

## Rendering Operations

### Render Updates

```brightscript
' Update single widget
m.render({
    id: "targetWidget",
    fields: {
        text: "Updated text",
        color: "#00FF00"
    }
})

' Update multiple widgets
m.render([
    {
        id: "widget1",
        fields: { visible: false }
    },
    {
        id: "widget2",
        fields: { color: "#FF0000" }
    }
])
```

### Add Children

```brightscript
' Add new children to widget
m.render({
    id: "container",
    children: [
        {
            id: "newChild",
            nodeType: "Label",
            fields: { text: "New Item" }
        }
    ]
})
```

### Render Callback

```brightscript
' Execute callback after render
m.render(payload, {
    callback: sub()
        print "Render completed"
    end sub
})
```

### Destroy Widgets

```brightscript
' Destroy single widget
m.erase({ id: "targetWidget" })

' Destroy multiple widgets
m.erase([
    { id: "widget1" },
    { id: "widget2" }
])
```

## State Management

### Using Dispatchers

```brightscript
{
    id: "stateWidget",
    viewModel: ViewModels.StateExample,
    onMountWidget: sub()
        ' Get dispatcher
        dispatcher = m.getDispatcher("dataState")

        ' Listen to state changes
        dispatcher.addListener({
            mapStateToProps: sub(props, state)
                props.items = state.items
            end sub,
            callback: m.updateUI
        })

        ' Dispatch action
        dispatcher.dispatch({
            type: "LOAD_DATA"
        })
    end sub,
    sub updateUI()
        ' Update based on new props
        m.render({
            id: "list",
            fields: { content: m.props.items }
        })
    end sub
}
```

### Create Dispatcher

```brightscript
' Create new dispatcher in widget
onMountWidget: sub()
    model = new Models.LocalStateModel()
    reducer = new Reducers.LocalStateReducer()

    Rotor.createDispatcher("localState", model, reducer)
end sub
```

## Internationalization

### Basic i18n

```brightscript
{
    id: "localizedWidget",
    viewModel: ViewModels.LocalizedWidget,
    i18n: {
        path: "menu"
    },
    onMountWidget: sub()
        ' Access translations from viewModelState.l10n
        title = m.viewModelState.l10n.title
        subtitle = m.viewModelState.l10n.subtitle
    end sub
}
```

### Multiple Paths

```brightscript
{
    i18n: {
        paths: ["menu", "buttons"]
    },
    onMountWidget: sub()
        ' Merged sections at root level
        menuTitle = m.viewModelState.l10n.title
        saveButton = m.viewModelState.l10n.save
    end sub
}
```

### RTL and Locale

```brightscript
{
    i18n: {
        path: "app",
        includeIsRtl: true,
        includeLocale: true
    },
    onMountWidget: sub()
        isRTL = m.viewModelState.isRTL
        locale = m.viewModelState.locale

        if isRTL
            ' Apply RTL layout
        end if
    end sub
}
```

## Animation

### Basic Animation

```brightscript
{
    id: "animatedWidget",
    nodeType: "Rectangle",
    fields: {
        color: "#FF0000",
        opacity: 0
    },
    onMountWidget: sub()
        ' Get animator
        fadeAnimator = m.animator("fade")

        ' Animate
        fadeAnimator.animateIn(m.node, {
            fromOpacity: 0,
            toOpacity: 1,
            duration: 500
        })
    end sub
}
```

## Dynamic Widget Creation

### Generate Children

```brightscript
{
    id: "dynamicContainer",
    nodeType: "Group",
    onMountWidget: sub()
        ' Generate child configurations
        children = []
        for i = 0 to 4
            children.push({
                id: "item-" + i.toStr(),
                nodeType: "Rectangle",
                fields: {
                    color: "#FF0000",
                    width: 100,
                    height: 50,
                    translation: [i * 110, 0]
                }
            })
        end for

        ' Render dynamic children
        m.render({
            id: m.id,
            children: children
        })
    end sub
}
```

## Best Practices

### Lifecycle Management

**Good:**
```brightscript
onMountWidget: sub()
    ' Initialize resources
    m.setupListeners()
end sub

onDestroyWidget: sub()
    ' Cleanup resources
    m.removeListeners()
end sub
```

**Avoid:**
```brightscript
onMountWidget: sub()
    ' Don't do expensive operations
    m.loadMassiveDataSet()  ' Blocks rendering
end sub
```

### Widget Lookup

**Good:**
```brightscript
' Use direct access when ID is known
widget = m.getWidget("knownId")

' Use pattern matching when needed
items = m.findWidgets("item-*")
```

**Avoid:**
```brightscript
' Don't use pattern matching for known IDs
widget = m.findWidgets("knownId")[0]  ' Inefficient
```

### State Updates

**Good:**
```brightscript
' Use dispatcher for state changes
dispatcher.dispatch({ type: "UPDATE", payload: data })
```

**Avoid:**
```brightscript
' Don't mutate viewModelState directly
m.viewModelState.data = newData  ' Wrong
```

## Troubleshooting

### Widget Not Found

```brightscript
targetWidget = m.getWidget("targetId")

if targetWidget = invalid
    print "Widget not found: targetId"

    ' List available children
    children = m.getChildrenWidgets()
    for each child in children
        print "Available: " + child.id
    end for
end if
```

### Debug Widget Tree

```brightscript
print "Widget ID: " + m.id

' Check hierarchy
parent = m.getWidget("../")
if parent <> invalid
    print "Parent ID: " + parent.id
else
    print "No parent (root widget)"
end if
```

### Lifecycle Issues

- **Hook not firing**: Check function assignment in configuration
- **Context errors**: Verify `m` refers to correct widget instance (use typecast statement)
- **Timing problems**: Understand hook execution order

### State Management Issues

- **Dispatcher not found**: Ensure dispatcher exists before access
- **State not updating**: Verify listener configuration
- **Memory leaks**: Invalidate references created by you in destroy lifecycle hooks

---

## 📚 Learn More

**NEXT STEP: [ViewModel Reference](./view-builder-viewmodel-reference.md)**

**Reference Documentation:**
- [ViewBuilder Overview](./view-builder-overview.md) - High-level architecture and concepts
- [ViewModel Reference](./view-builder-viewmodel-reference.md) - Complete ViewModel structure, lifecycle, and state management

**Plugin Documentation:**
- [Fields Plugin](./view-builder-fields-plugin.md) - Field management with expressions and interpolation
- [FontStyle Plugin](./view-builder-fontstyle-plugin.md) - Typography and font styling
- [Observer Plugin](./view-builder-observer-plugin.md) - Field observation patterns
- [Focus Plugin](./view-builder-focus-plugin.md) - Focus management and navigation

**Additional Documentation:**
- [Cross-Thread MVI design pattern](./cross-thread-mvi.md) - State management across threads
- [Internationalization support](./i18n-support.md) - Locale-aware interface implementation
