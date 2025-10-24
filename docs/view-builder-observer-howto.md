# Rotor Framework Observer Plugin - How-To Guide

← [Back to Documentation](../README.md#-learn-more)

## Overview

The Observer Plugin is a powerful field observation system within the Rotor Framework that provides automatic SceneGraph field monitoring and callback management. It simplifies reactive programming patterns by automatically managing observer registration, callback routing, and cleanup through the widget lifecycle, enabling you to respond to field changes on any SceneGraph node.

## Key Features

- **Automatic Field Observation**: Monitors SceneGraph node field changes with native `observeFieldScoped`
- **Lifecycle Management**: Automatic observer registration and cleanup during widget mount/unmount
- **Callback Routing**: Intelligent routing of field change events to the correct widget callbacks
- **Multiple Observers**: Support for multiple observers per widget with array configuration
- **Payload Processing**: Optional payload transformation before callback execution
- **Conditional Observers**: Support for `once` and `until` conditional observation patterns
- **Scoped Callbacks**: Proper callback execution within widget scope context

## Basic Usage

### 1. Simple Field Observer

Monitor a single field change on the widget's node:

```brightscript
// Basic field observer configuration
{
    nodeType: "Label",
    observer: {
        fieldId: "text",
        callback: sub(payload)
            print "Text changed to: " + payload.text
        end sub
    },
    fields: {
        text: "Initial text"
    }
}
```

### 2. Multiple Field Observers

Monitor multiple fields using array configuration:

```brightscript
// Multiple observers on the same widget
{
    nodeType: "Video",
    observer: [
        {
            fieldId: "state",
            callback: sub(payload)
                print "Video state changed: " + payload.state
            end sub
        },
        {
            fieldId: "position",
            callback: sub(payload)
                print "Video position: " + payload.position.toStr()
            end sub
        }
    ]
}
```

## Configuration Properties

### Observer Configuration Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `fieldId` | string | Yes | Name of the SceneGraph field to observe |
| `callback` | function | Yes | Function to call when field changes |
| `id` | string | No | Custom identifier for the observer |
| `value` | dynamic | No | Initial value to set on the field |
| `alwaysNotify` | boolean | No | Always trigger callback even if value unchanged (default: true) |
| `once` | boolean | No | Remove observer after first callback (default: false) |
| `until` | function | No | Function returning true when observer should be removed |
| `parsePayload` | function | No | Transform payload before passing to callback |
| `infoFields` | array | No | Additional fields to include in callback payload |

### Observer Types

| Configuration | Description | Example |
|---------------|-------------|---------|
| Single Object | One observer per widget | `observer: { fieldId: "text", callback: ... }` |
| Array | Multiple observers per widget | `observer: [{ fieldId: "state" }, { fieldId: "position" }]` |

## Common Usage Patterns

### 1. Video Player State Monitoring

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/faders/previewVideo.bs
{
    nodeType: "Video",
    observer: [
        {
            fieldId: "state",
            callback: sub(payload)
                if payload.state = "playing"
                    m.node.visible = true
                    m.parent.node.shouldShowVideo = true
                else if payload.state = "finished" or payload.state = "error"
                    m.parent.node.shouldShowVideo = false
                end if
            end sub
        },
        {
            fieldId: "position",
            callback: sub(payload)
                if m.viewModelState.shouldShowVideo = true and m.node.duration - payload.position < 1
                    m.parent.node.shouldShowVideo = false
                end if
            end sub
        }
    ]
}
```

### 2. Auto-Sizing Button with Render Tracking

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/buttons/simpleButton.bs
{
    id: "buttonLabel",
    nodeType: "Label",
    fields: {
        enableRenderTracking: true,
        text: m.props.text
    },
    observer: [
        {
            fieldId: "renderTracking",
            callback: autoSizeObserverCallback
        },
        {
            fieldId: "text",
            callback: autoSizeObserverCallback
        }
    ]
}
```

### 3. Animation State Observer

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/pages/moviesPage.bs
{
    nodeType: "Group",
    observer: m.showPageAnimationObserver,
    children: [
        // Page content
    ]
}

// In ViewModel
sub onCreateView()
    m.showPageAnimationObserver = {
        fieldId: "animationState",
        callback: sub(payload)
            if payload.animationState = "finished"
                m.getViewModel().onAnimationComplete()
            end if
        end sub
    }
end sub
```

## Advanced Features

### 1. Payload Processing with parsePayload

Transform the payload before it reaches your callback:

```brightscript
{
    nodeType: "Label",
    observer: {
        fieldId: "text",
        parsePayload: function(payload) as object
            return {
                originalText: payload.text,
                textLength: Len(payload.text),
                timestamp: CreateObject("roDateTime").AsSeconds()
            }
        end function,
        callback: sub(payload)
            print "Text: " + payload.originalText
            print "Length: " + payload.textLength.toStr()
            print "Changed at: " + payload.timestamp.toStr()
        end sub
    }
}
```

### 2. Conditional Observer with `once`

Observer that removes itself after first callback:

```brightscript
{
    nodeType: "Animation",
    observer: {
        fieldId: "state",
        once: true,
        callback: sub(payload)
            print "Animation started, observer will now be removed"
        end sub
    }
}
```

### 3. Conditional Observer with `until`

Observer that removes itself when condition is met:

```brightscript
{
    nodeType: "Video",
    observer: {
        fieldId: "position",
        until: function(payload) as boolean
            return payload.position >= 30  // Remove after 30 seconds
        end function,
        callback: sub(payload)
            print "Video position: " + payload.position.toStr()
        end sub
    }
}
```

### 4. Observer with Additional Info Fields

Include additional node fields in the callback payload:

```brightscript
{
    nodeType: "Label",
    observer: {
        fieldId: "text",
        infoFields: ["color", "font"],
        callback: sub(payload)
            print "Text: " + payload.text
            print "Color: " + payload.color
            print "Font size: " + payload.font.size.toStr()
        end sub
    }
}
```

### 5. Setting Initial Values

Set an initial field value that triggers observation:

```brightscript
{
    nodeType: "Rectangle",
    observer: {
        fieldId: "width",
        value: 100,  // Sets initial width to 100
        alwaysNotify: true,  // Callback will fire even if width was already 100
        callback: sub(payload)
            print "Width changed to: " + payload.width.toStr()
        end sub
    }
}
```

## Plugin Methods

The Observer Plugin operates automatically through the widget lifecycle - no manual methods are required for basic usage.

### Plugin Lifecycle Integration

| Lifecycle Hook | When Called | Purpose |
|----------------|-------------|---------|
| `beforeMount` | Before widget is mounted | Register all observers from configuration |
| `beforeUpdate` | Before widget updates | Detach old observers and attach new ones |
| `beforeDestroy` | Before widget is destroyed | Cleanup all observers to prevent memory leaks |

### Observer Registration Process

1. **Configuration Processing**: Plugin processes single object or array of observer configs
2. **Node Preparation**: Adds helper interface field to the target node
3. **Observer Creation**: Creates Observer instances with unique IDs and attachment tracking
4. **Native Registration**: Calls `node.observeFieldScoped()` with proper callback routing
5. **Callback Routing**: Routes field changes to correct observer callbacks via global function
6. **Automatic Cleanup**: Removes observers when widget is destroyed or updated

## Best Practices

### 1. Use Descriptive Field IDs

Always observe specific, well-defined SceneGraph fields:

```brightscript
// Good: Observe specific fields
observer: {
    fieldId: "state",  // Clear SceneGraph field
    callback: sub(payload)
        // Handle state change
    end sub
}

// Avoid: Observing undefined or custom fields without setup
observer: {
    fieldId: "customField",  // May not exist on node
    callback: sub(payload)
        // May never be called
    end sub
}
```

### 2. Handle Observer Scope Correctly

Observers execute in widget scope, so `m` refers to the widget:

```brightscript
observer: {
    fieldId: "text",
    callback: sub(payload)
        // `m` refers to the widget instance
        m.updateRelatedWidgets(payload.text)
        
        // Access widget properties and methods
        if m.props.autoUpdate
            m.getViewModel().processTextChange(payload.text)
        end if
    end sub
}
```

### 3. Use parsePayload for Complex Data Processing

```brightscript
observer: {
    fieldId: "customData",
    parsePayload: function(payload) as object
        // Transform complex data structures
        processedData = {
            items: payload.customData.items,
            count: payload.customData.items.count(),
            hasValidData: payload.customData <> invalid
        }
        return processedData
    end function,
    callback: sub(payload)
        // Work with clean, processed data
        if payload.hasValidData
            print "Processing " + payload.count.toStr() + " items"
        end if
    end sub
}
```

### 4. Performance Considerations

- **Minimize Observer Count**: Use fewer, more targeted observers rather than many small ones
- **Use `once` for One-Time Events**: Remove observers that only need to fire once
- **Clean Payloads**: Use `parsePayload` to reduce callback processing overhead
- **Avoid Heavy Callbacks**: Keep observer callbacks lightweight and fast

## Common Pitfalls

1. **Observing Non-Existent Fields**: Ensure fields exist on the target node type
2. **Memory Leaks**: Plugin handles cleanup automatically, but avoid circular references in callbacks
3. **Callback Scope**: Remember `m` in callbacks refers to the widget, not the node
4. **Performance**: Too many observers can impact performance - use judiciously
5. **Field Initialization**: If observing fields that may not exist, set initial values
6. **Callback Errors**: Exceptions in observer callbacks can break the observation chain

## Troubleshooting

### Observer Not Firing

```brightscript
// Debug observer setup
sub debugObserver(widget as object)
    print "Widget ID: " + widget.id
    print "Node Type: " + widget.nodeType
    print "Observer Config: " + FormatJson(widget.observer)
    
    // Check if field exists on node
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
- **Verify node type**: Confirm the field exists for the specific node type
- **Test field changes**: Manually change the field to verify observation works
- **Check callback function**: Ensure callback is a valid function reference

### Performance Issues

- **Profile callbacks**: Use timing to measure callback execution
- **Reduce observer count**: Combine related observations when possible
- **Optimize parsePayload**: Keep payload processing minimal and fast

## Observer Plugin Integration

### With Fields Plugin

```brightscript
{
    nodeType: "Label",
    fields: {
        text: function() as string
            return m.props.dynamicText
        end function
    },
    observer: {
        fieldId: "text",
        callback: sub(payload)
            // Respond to field changes from fields plugin
            m.getViewModel().onTextUpdated(payload.text)
        end sub
    }
}
```

### With Focus Plugin

```brightscript
{
    nodeType: "Button",
    focus: {
        onFocusChanged: sub(isFocused)
            // Focus plugin updates viewModelState.isFocused
        end sub
    },
    observer: {
        fieldId: "buttonSelected",
        callback: sub(payload)
            // Observe button selection events
            if m.viewModelState.isFocused and payload.buttonSelected
                m.getViewModel().handleFocusedSelection()
            end if
        end sub
    }
}
```

## Advanced Observer Patterns

### 1. Chained Observers

```brightscript
{
    nodeType: "Video",
    observer: [
        {
            fieldId: "state",
            callback: sub(payload)
                if payload.state = "playing"
                    // Enable position monitoring
                    m.setupPositionObserver()
                end if
            end sub
        }
    ]
}
```

### 2. State Machine with Observers

```brightscript
// State-driven observer configuration
sub setupStateObservers()
    stateObservers = [
        {
            fieldId: "loadingState",
            callback: sub(payload)
                if payload.loadingState = "complete"
                    m.transitionToPlayingState()
                end if
            end sub
        },
        {
            fieldId: "errorState", 
            callback: sub(payload)
                if payload.errorState <> ""
                    m.handleError(payload.errorState)
                end if
            end sub
        }
    ]
    
    // Apply observers to widget
    m.updateWidget("mediaPlayer", { observer: stateObservers })
end sub
```

### 3. Dynamic Observer Management

```brightscript
// Conditional observer setup based on widget state
function createObserverConfig() as object
    baseObservers = [{
        fieldId: "content",
        callback: sub(payload)
            m.handleContentChange(payload.content)
        end sub
    }]
    
    // Add additional observers based on conditions
    if m.props.enablePositionTracking
        baseObservers.push({
            fieldId: "position",
            callback: sub(payload)
                m.trackPlaybackPosition(payload.position)
            end sub
        })
    end if
    
    return baseObservers
end function
```

