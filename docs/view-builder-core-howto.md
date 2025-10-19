# Rotor Framework Core Widget Configuration - How-To Guide

← [Back to Documentation](../README.md#-learn-more)

## Overview

The Core Widget Configuration provides the fundamental built-in properties and methods that are automatically available on every widget in the Rotor Framework. This covers basic widgets - the building blocks of the UI. ViewModels are a specialized extension of widgets that add template rendering and enhanced lifecycle management. This document focuses on the core widget functionality that underlies both simple widgets and ViewModels.

## Key Features

- **Widget Lifecycle Hooks**: Built-in lifecycle methods (`onMountWidget`, `onUpdateWidget`, `onDestroyWidget`)
- **Widget Navigation Methods**: Tree traversal and widget lookup functionality
- **State Management Integration**: Direct access to dispatchers and framework services
- **Internationalization Support**: Built-in i18n configuration and locale management
- **Rendering Control**: Direct rendering and refresh capabilities
- **Animation Integration**: Built-in animator factory access
- **Framework Integration**: Direct access to framework instance and services
- **Debug Support**: Development-time widget identification and debugging

## Basic Usage

### 1. Basic Widget Structure

Every widget automatically receives core configuration properties and methods:

```brightscript
// Basic widget (not a ViewModel) with core properties
{
    id: "simpleWidget",
    nodeType: "Label",
    fields: {
        text: "Hello World",
        color: "#FFFFFF"
    },
    onMountWidget: sub()
        print "Simple widget mounted"
    end sub
}
```

### 2. Widget with ViewModel

When using a ViewModel, the widget gets additional capabilities:

```brightscript
// Widget that uses a ViewModel class
{
    id: "viewModelWidget", 
    viewModel: ViewModels.MyWidget,  // This makes it a ViewModel
    props: {
        title: "Hello World"
    },
    viewModelState: {
        isActive: false
    }
}
```

### 3. Basic Widget Lifecycle Hooks

Use built-in lifecycle hooks for widget management:

```brightscript
// Basic widget with lifecycle hooks
{
    id: "lifecycleWidget",
    nodeType: "Label",
    fields: {
        text: "Lifecycle Example"
    },
    onMountWidget: sub()
        print "Widget mounted: " + m.id
        // Basic initialization for simple widgets
    end sub,
    onUpdateWidget: sub()
        print "Widget updated: " + m.id
        // Handle configuration changes
    end sub,
    onDestroyWidget: sub()
        print "Widget destroyed: " + m.id
        // Cleanup resources
    end sub
}
```

## Configuration Properties

### Core Configuration Keys

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the widget |
| `nodeType` | string | No | SceneGraph node type (default: "Group") |
| `viewModel` | class | No | ViewModel class (when specified, widget becomes a ViewModel) |
| `props` | object | No | Properties passed to ViewModels (not used by basic widgets) |
| `viewModelState` | object | No | Initial state for ViewModels (not used by basic widgets) |
| `children` | object/array | No | Child widget configurations |
| `zIndex` | integer | No | Z-order for rendering priority |

### Lifecycle Hook Properties

| Property | Type | Description |
|----------|------|-------------|
| `onMountWidget` | function | Called when widget is mounted to the scene |
| `onUpdateWidget` | function | Called when widget configuration updates |
| `onDestroyWidget` | function | Called before widget is destroyed |
| `onRenderSettled` | function | Called after render operation completes |

### Internationalization Properties

| Property | Type | Description |
|----------|------|-------------|
| `i18n.path` | string | Single path for i18n key lookup |
| `i18n.paths` | array | Multiple paths for i18n key lookup |
| `i18n.includeIsRtl` | boolean | Include RTL flag in viewModelState |
| `i18n.includeLocale` | boolean | Include locale string in viewModelState |

## Widget Method Decoration

### Automatic Method Injection

Every widget is automatically decorated with core methods during creation. These methods provide essential functionality for widget interaction and framework integration:

```brightscript
// Example usage of injected methods in widget callbacks
{
    id: "decoratedWidget",
    nodeType: "Group",
    onMountWidget: sub()
        // Use injected methods
        framework = m.getFrameworkInstance()
        parentVM = m.getParentViewModel()
        childWidget = m.getWidget("childId")
    end sub
}
```

### Core Injected Methods

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `getFrameworkInstance` | None | object | Returns the framework instance |
| `getInfo` | None | object | Returns framework info (device, version, etc.) |
| `getWidget` | `searchPattern` (string) | object | Find widget by ID/HID pattern |
| `getSiblingWidget` | `id` (string) | object | Get sibling widget by ID |
| `getViewModel` | None | object | Get the widget's ViewModel instance |
| `getParentViewModel` | None | object | Get parent widget's ViewModel |
| `getRootWidget` | None | object | Get root widget of the tree |
| `findWidgets` | `searchPattern` (string) | array | Find multiple widgets by pattern |
| `getChildrenWidgets` | `searchPattern` (string) | array | Get child widgets |
| `getSubtreeClone` | `searchPattern`, `keyPathList` | object | Clone widget subtree |
| `render` | `payloads`, `params` | void | Trigger rendering of widgets |
| `refresh` | `featureKeyPaths` | void | Refresh specific widget features |
| `erase` | `payloads`, `shouldSkipNodePool` | void | Destroy widgets |
| `getDispatcher` | `dispatcherId` (string) | object | Get state dispatcher |
| `createDispatcher` | `dispatcherId`, `model`, `reducer` | object | Create new dispatcher |
| `animator` | `animatorId` (string) | object | Get animator factory |

## Common Usage Patterns

### 1. Basic Widget with Lifecycle Management

```brightscript
// Basic widget (not a ViewModel) with lifecycle management
{
    id: "managedWidget",
    nodeType: "Group",
    fields: {
        visible: true
    },
    onMountWidget: sub()
        // Initialize widget resources
        m.setupTimers()
        m.initializeState()
    end sub,
    onUpdateWidget: sub()
        // Handle configuration changes
        m.updateBasedOnNewConfig()
    end sub,
    onDestroyWidget: sub()
        // Cleanup resources
        m.clearTimers()
        m.cleanup()
    end sub,
    children: [
        {
            id: "childLabel",
            nodeType: "Label",
            fields: { text: "Child widget" }
        }
    ]
}
```

### 2. Basic Widget with Child Navigation

```brightscript
// Basic widget using child navigation methods
{
    id: "containerWidget",
    nodeType: "Group",
    onMountWidget: sub()
        // Access child widgets using core methods
        m.titleLabel = m.getWidget("titleLabel")
        m.buttonGroup = m.getWidget("buttonGroup")
        
        // Setup navigation between children
        m.setupChildNavigation()
    end sub,
    children: [
        {
            id: "titleLabel",
            nodeType: "Label",
            fields: { text: "Container Title" }
        },
        {
            id: "buttonGroup",
            nodeType: "Group",
            children: [
                {
                    id: "button1",
                    nodeType: "Rectangle",
                    fields: { color: "#FF0000" }
                },
                {
                    id: "button2", 
                    nodeType: "Rectangle",
                    fields: { color: "#00FF00" }
                }
            ]
        }
    ]
}
```

### 3. ViewModel Widget with State Management

```brightscript
// ViewModel widget using state management (note: has viewModel property)
{
    id: "stateWidget",
    nodeType: "Group", 
    viewModel: ViewModels.StateExample,  // This makes it a ViewModel
    props: {
        dataKey: "example"
    },
    onMountWidget: sub()
        // ViewModels can use dispatchers for state management
        m.dataDispatcher = m.getDispatcher("exampleData")
        
        // Setup state listener (ViewModel feature)
        m.dataDispatcher.addListener({
            mapStateToProps: sub(props, state)
                props.items = state.items
                props.loading = state.loading
            end sub
        })
        
        // Load initial data
        m.dataDispatcher.dispatch({
            type: "LOAD_DATA"
        })
    end sub
}
```

### 4. ViewModel with Internationalization

```brightscript
// ViewModel with i18n configuration (only ViewModels support i18n)
{
    id: "localizedWidget",
    nodeType: "Group",
    viewModel: ViewModels.LocalizedWidget,  // Required for i18n features
    i18n: {
        path: "menu.items",
        includeIsRtl: true,
        includeLocale: true
    },
    onMountWidget: sub()
        // Access i18n data in viewModelState (ViewModel feature)
        title = m.viewModelState.l10n.menu.items.title
        isRightToLeft = m.viewModelState.isRTL
        currentLocale = m.viewModelState.locale
        
        // Use i18n data to configure widgets
        m.updateLocalizedContent()
    end sub
}
```

## Advanced Features

### 1. Dynamic Widget Creation and Management

```brightscript
// Method for dynamic basic widget creation
sub createDynamicChildren()
    childConfigs = []
    
    for i = 0 to 5
        childConfigs.push({
            id: "dynamicWidget-" + i.toStr(),
            nodeType: "Rectangle",
            fields: {
                color: "#FF0000",
                width: 100,
                height: 50,
                translation: [i * 110, 0]
            },
            onMountWidget: sub()
                print "Dynamic widget mounted: " + m.id
            end sub
        })
    end for
    
    // Render new children using core render method
    m.render({
        id: m.id,
        children: childConfigs
    })
end sub
```

### 2. Widget Tree Navigation

```brightscript
// Widget tree navigation using core methods
sub navigateWidgetTree()
    // Find widgets by pattern
    allRectangles = m.findWidgets("*Rectangle*")
    allLabels = m.findWidgets("*Label*")
    
    // Get specific child widget
    specificChild = m.getWidget("container/childWidget")
    
    // Get sibling widgets
    siblingWidget = m.getSiblingWidget("siblingId")
    
    // Get all children
    allChildren = m.getChildrenWidgets()
    
    // Access parent widget (for basic widgets, use getWidget to navigate up)
    parentWidget = m.getWidget("../")  // Navigate to parent
    
    // Clone subtree for templating
    templateClone = m.getSubtreeClone("templateContainer", ["fields"])
end sub
```

### 3. Advanced Rendering Control

```brightscript
// Widget rendering control (works for both basic widgets and ViewModels)
sub updateWidgetContent()
    // Update multiple child widgets
    updateConfigs = [
        {
            id: "child1",
            fields: { 
                text: "Updated text",
                color: "#00FF00"
            }
        },
        {
            id: "child2", 
            fields: { 
                visible: false
            }
        }
    ]
    
    // Render updates with callback
    m.render(updateConfigs, {
        callback: sub()
            print "Widget update completed"
        end sub
    })
    
    // For ViewModels, you can also refresh specific paths
    ' m.refresh(["props.title", "viewModelState.isActive"])  ' ViewModel feature
end sub
```

### 4. Animation Integration

```brightscript
// Widget with animation support
{
    id: "animatedWidget",
    nodeType: "Group",
    onMountWidget: sub()
        // Get animator factory
        fadeAnimator = m.animator("fade")
        
        // Create animation
        fadeAnimator.create({
            target: m.node,
            duration: 1000,
            fromOpacity: 0,
            toOpacity: 1
        })
        
        fadeAnimator.start()
    end sub
}
```

## Best Practices

### 1. Lifecycle Hook Usage

Use lifecycle hooks appropriately for widget management:

```brightscript
// Good: Proper lifecycle management
{
    onMountWidget: sub()
        // Initialize resources, setup listeners
        m.setupEventListeners()
        m.loadInitialData()
    end sub,
    onUpdateWidget: sub()
        // Handle configuration changes
        m.updateConfigurationDependentFeatures()
    end sub,
    onDestroyWidget: sub()
        // Cleanup resources
        m.removeEventListeners()
        m.cancelPendingRequests()
    end sub
}

// Avoid: Heavy operations in onMountWidget
{
    onMountWidget: sub()
        // Don't do expensive operations here
        m.loadMassiveDataSet()  // Bad - blocks rendering
    end sub
}
```

### 2. Widget Navigation Patterns

Use appropriate methods for widget lookup:

```brightscript
// Good: Specific widget access
specificWidget = m.getWidget("knownChildId")
siblingWidget = m.getSiblingWidget("siblingId")

// Good: Pattern-based search when needed
menuItems = m.findWidgets("menuItem-*")

// Avoid: Unnecessary tree traversal
// Don't use findWidgets when you know the exact ID
```

### 3. State Management Integration

Integrate properly with framework state management:

```brightscript
// Good: Proper dispatcher usage
sub setupStateManagement()
    dispatcher = m.getDispatcher("myData")
    dispatcher.addListener({
        mapStateToProps: sub(props, state)
            props.relevantData = state.relevantData
        end sub
    })
end sub

// Avoid: Direct state manipulation
// Don't modify viewModelState directly without proper update flow
```

## Common Pitfalls

1. **Heavy Lifecycle Operations**: Avoid expensive operations in `onMountWidget` that block rendering
2. **Memory Leaks**: Always cleanup resources in `onDestroyWidget`
3. **Improper Widget Lookup**: Using inefficient search patterns when direct access is available
4. **State Mutation**: Directly modifying viewModelState without proper update mechanisms
5. **Missing Error Handling**: Not checking if widgets exist before accessing them
6. **Circular References**: Creating circular dependencies in widget relationships

## Troubleshooting

### Widget Not Found Issues

```brightscript
// Debug widget tree structure
sub debugWidgetTree()
    print "Current widget: " + m.id
    print "Parent HID: " + m.parentHID
    print "Widget HID: " + m.HID
    
    // Check if target widget exists
    targetWidget = m.getWidget("targetId")
    if targetWidget = invalid
        print "Widget not found: targetId"
        // List available children
        children = m.getChildrenWidgets()
        for each child in children
            print "Available child: " + child.id
        end for
    else
        print "Widget found: " + targetWidget.id
    end if
end sub
```

### Lifecycle Hook Problems

- **Hook not firing**: Ensure function is properly assigned to configuration
- **Context issues**: Check that `m` refers to correct widget instance
- **Timing problems**: Understand hook execution order in widget lifecycle

### State Management Issues

- **Dispatcher not found**: Ensure dispatcher is created before accessing
- **State not updating**: Check if listener is properly configured
- **Memory leaks**: Always remove listeners in onDestroyWidget

## Core Integration Patterns

### Widget vs ViewModel Distinction

```brightscript
// Basic Widget - uses core functionality only
{
    id: "basicWidget",
    nodeType: "Label", 
    fields: {
        text: "Basic Widget"
    },
    onMountWidget: sub()
        // Core methods available
        framework = m.getFrameworkInstance()
        child = m.getWidget("childId") 
    end sub
}

// ViewModel - extends widget with additional capabilities
{
    id: "viewModelWidget",
    viewModel: ViewModels.MyViewModel,  // This line makes it a ViewModel
    props: {
        title: "ViewModel Widget"
    },
    viewModelState: {
        isActive: true
    },
    i18n: {
        path: "ui.labels"  // i18n only works with ViewModels
    },
    onMountWidget: sub()
        // All core methods PLUS ViewModel features
        dispatcher = m.getDispatcher("myState")  // State management
        localized = m.viewModelState.l10n.ui.labels.title  // i18n
    end sub
}
```

### With Animation System

```brightscript
// Widget with integrated animation
{
    id: "animatedComponent",
    onMountWidget: sub()
        // Setup entrance animation
        animator = m.animator("slideIn")
        animator.animateIn(m.node, {
            direction: "left",
            duration: 500
        })
    end sub,
}
```

The Core Widget Configuration provides the essential foundation for all widgets in the Rotor Framework. Basic widgets use these core capabilities for simple UI elements, while ViewModels extend this foundation with additional features like state management, template rendering, and internationalization. By understanding the distinction between basic widgets and ViewModels, you can choose the appropriate approach for your UI components and leverage the full power of the framework's architecture.
