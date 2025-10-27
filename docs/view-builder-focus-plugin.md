# Focus Configuration

← [Back to Documentation]../(README.md#-learn-more)

## Overview

The Focus Plugin is one of the most sophisticated components of the Rotor Framework, providing advanced focus management and spatial navigation for Roku applications. It implements TV-friendly navigation patterns with features like focus groups, spatial navigation, long press support, and focus bubbling.

## Key Features

- **Spatial Navigation**: Automatic directional navigation based on widget positions
- **Focus Groups**: Hierarchical focus management with parent-child relationships
- **Focus Bubbling**: Focus propagation through ancestor groups
- **Focus Capturing**: Descendant focus resolution
- **Long Press Support**: Configurable long press detection and handling
- **Static Navigation**: Predefined navigation paths between widgets
- **Native Focus Integration**: Optional SceneGraph native focus support
- **Automatic State Management**: Automatically updates `viewModelState.isFocused` property

## Basic Usage

### 1. Focus Items (Individual Focusable Elements)

Focus items are individual widgets that can receive focus:

```brightscript
' Basic focus item configuration
focus: {
    isEnabled: true,
    onFocusChanged: sub(isFocused as boolean)
        if isFocused
            m.node.blendColor = "0xFF0000FF" ' Red when focused
        else
            m.node.blendColor = "0xFFFFFFFF" ' White when not focused
        end if
        
        ' Note: viewModelState.isFocused is automatically updated by the plugin
    end sub,
    onSelected: sub()
        print "Button selected!"
    end sub
}
```

### 2. Focus Groups (Container-Level Navigation)

Focus groups manage navigation between multiple focusable items:

```brightscript
' Basic focus group configuration
focus: {
    group: {
        defaultFocusId: "firstButton",
        onFocusChanged: sub(isFocused)
            print "Group focus changed: " + isFocused.toStr()
        end sub
    }
}
```

## Configuration Properties

### Focus Item Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isEnabled` | boolean | `true` | Enable/disable focus capability |
| `enableNativeFocus` | boolean | `false` | Allow native SceneGraph focus |
| `enableSpatialNavigation` | boolean | `true` | Enable automatic spatial navigation |
| `up/down/left/right/back` | string/function | `""` | Static navigation directions |
| `onFocusChanged` | function | `invalid` | Called when focus state changes |
| `onFocus` | function | `invalid` | Called when widget gains focus |
| `onSelected` | function | `invalid` | Called when OK button is pressed |
| `longPressHandler` | function | `invalid` | Handle long press events |

### Focus Group Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `defaultFocusId` | string/function | `""` | Default focus target when group receives focus |
| `lastFocusedHID` | string | `""` | Remember last focused item |
| `enableSpatialEnter` | boolean | `false` | Enable spatial navigation when entering group |
| `up/down/left/right/back` | string/function | `""` | Navigation directions to other groups |

## Common Usage Patterns

### 1. Simple Button with Focus Styling

```brightscript
' File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/buttons/simpleButton.bs
focus: {
    isEnabled: true,
    onFocusChanged: sub(isFocused as boolean)
        bg = m.getWidget("buttonBg")
        label = m.getWidget("buttonBg/buttonLabel")
        
        if isFocused
            bg.node.blendColor = UI.components.buttons.simpleButton.bgColor_focused
            label.node.color = UI.components.buttons.simpleButton.textColor_focused
        else
            bg.node.blendColor = UI.components.buttons.simpleButton.bgColor
            label.node.color = UI.components.buttons.simpleButton.textColor
        end if
    end sub,
    onSelected: sub()
        ' Handle button selection
        m.getViewModel().onButtonPressed()
    end sub
}
```

### 2. Card with Native Focus and Long Press

```brightscript
' File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/carousel/cards/defaultCard.bs
focus: {
    enableNativeFocus: true,
    enableSpatialNavigation: false,
    onFocusChanged: sub(isFocused)
        m.onFocusChangedHook(isFocused)
    end sub,
    onFocus: sub()
        m.dispatchFocusedCard()
        m.onFocusHook()
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
```

### 3. Menu Group with Static Navigation

```brightscript
' File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/layout/pageMenu/pageMenu.bs
focus: {
    group: {
        defaultFocusId: "homeMenuItem",
        down: "additionalMenuItems", ' Points to another group
        onFocusChanged: sub(isFocused)
            m.getViewModel().updateMenuVisibility(isFocused)
        end sub
    }
}
```

### 4. Hierarchical Group Structure

```brightscript
' Main sidebar group
{
    id: "mainSidebar",
    focus: {
        group: {
            onFocusChanged: sub(isFocused)
                m.getViewModel().layoutMenuAnimation(isFocused)
            end sub,
            onFocus: sub()
                m.plugins.focus.enableFocusNavigation(true)
            end sub
        }
    },
    children: [
        {
            id: "pageMenu",
            viewModel: ViewModels.PageMenu,
            props: {
                down: "additionalMenuItems"
            }
        },
        {
            id: "additionalMenuItems",
            focus: {
                group: {
                    defaultFocusId: "exitMenuItem",
                    up: "pageMenu"
                }
            }
        }
    ]
}
```

## Advanced Features

### 1. Static Navigation with Functions

You can use functions for dynamic navigation logic:

```brightscript
focus: {
    up: function() as string
        if m.props.isInSpecialMode
            return "specialModeButton"
        else
            return "normalButton"
        end if
    end function,
    onSelected: sub()
        m.getViewModel().handleSelection()
    end sub
}
```

### 2. Spatial Navigation Control

```brightscript
' Disable spatial navigation for precise control
focus: {
    enableSpatialNavigation: false,
    up: "specificButtonAbove",
    down: "specificButtonBelow",
    left: "specificButtonLeft",
    right: "specificButtonRight"
}
```

### 3. Long Press Configuration

```brightscript
focus: {
    longPressHandler: sub(isLongPress as boolean, key as string)
        if isLongPress
            print "Long press started with key: " + key
            ' Start continuous action
            m.getViewModel().startContinuousAction()
            return true ' Indicate we handled it
        else
            print "Long press ended"
            ' Stop continuous action
            m.getViewModel().stopContinuousAction()
            return false
        end if
    end sub
}
```

### 4. Group with Spatial Enter

```brightscript
focus: {
    group: {
        defaultFocusId: "centerItem",
        enableSpatialEnter: true, ' Use spatial navigation when entering group
        onFocusChanged: sub(isFocused)
            m.getViewModel().updateGroupState(isFocused)
        end sub
    }
}
```

## Focus State Integration

### Automatic viewModelState Updates

The Focus Plugin automatically maintains the `viewModelState.isFocused` property for all focusable widgets:

```brightscript
' Access current focus state anywhere in your widget
sub someWidgetMethod()
    if m.viewModelState.isFocused
        print "This widget currently has focus"
        ' Perform focus-specific logic
    else
        print "This widget does not have focus"
    end if
end sub

' Use in field functions for dynamic styling
fields: {
    color: function() as string
        if m.viewModelState.isFocused
            return UI.colors.focused
        else
            return UI.colors.default
        end if
    end function
}
```

### Focus State in Templates

You can reference the focus state directly in widget templates:

```brightscript
' Example: Dynamic button styling based on focus state
{
    nodeType: "Rectangle",
    fields: {
        color: function() as string
            if m.viewModelState.isFocused
                return UI.components.buttons.simpleButton.bgColor_focused
            else
                return UI.components.buttons.simpleButton.bgColor
            end if
        end function
    }
}
```

## Widget Method Decoration

### Automatic Method Injection

The Focus Plugin automatically decorates widgets with focus-specific methods during widget creation. When a widget has focus configuration, the plugin injects methods directly into the widget instance, making them accessible through the `widget.plugins.focus` namespace.

```brightscript
' These methods are automatically available on widgets with focus configuration
{
    nodeType: "Button",
    focus: {
        isEnabled: true,
        onSelected: sub()
            ' Now you can call focus methods directly on this widget
            m.plugins.focus.setFocus("otherWidget")
        end sub
    }
}
```

### Widget Decoration Process

1. **Plugin Registration**: Focus Plugin defines `widgetMethods` object with available methods
2. **Widget Creation**: During widget creation, framework checks if plugin has `widgetMethods`
3. **Method Injection**: Framework creates `widget.plugins.focus` namespace and copies methods
4. **Context Binding**: Methods are bound with widget's `HID`, `pluginKey`, and other metadata
5. **Global Access**: Methods can access framework instance and plugin state through global scope

## Plugin Methods

### Available Methods on Widgets

```brightscript
' Set focus to current widget
widget.plugins.focus.setFocus(true)

' Set focus to another widget by ID
widget.plugins.focus.setFocus("targetWidgetId")

' Get currently focused widget
focusedWidget = widget.plugins.focus.getFocusedWidget()

' Enable/disable focus navigation globally
widget.plugins.focus.enableFocusNavigation(true)

' Check if focus navigation is enabled
isEnabled = widget.plugins.focus.isFocusNavigationEnabled()

' Handle long press manually
result = widget.plugins.focus.proceedLongPress()

' Check if long press is active
isActive = widget.plugins.focus.isLongPressActive()
```

### Injected Method Details

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `setFocus` | `isFocused` (boolean/string), `enableNativeFocus` (boolean) | boolean | Set focus on current widget (boolean) or target widget (string ID) |
| `getFocusedWidget` | None | object | Returns currently focused widget instance |
| `enableFocusNavigation` | `enabled` (boolean) | void | Globally enable/disable focus navigation |
| `isFocusNavigationEnabled` | None | boolean | Check if focus navigation is enabled |
| `proceedLongPress` | None | object | Manually trigger long press navigation action |
| `isLongPressActive` | None | boolean | Check if long press is currently active |

### Method Implementation Details

All injected methods work by:
1. **Global Access**: Getting framework instance through `GetGlobalAA().rotor_framework_helper.frameworkInstance`
2. **Plugin Reference**: Accessing the Focus Plugin through `plugins[pluginKey]`
3. **Context Preservation**: Using widget's `HID` and `pluginKey` for proper targeting
4. **Delegation**: Calling corresponding methods on the plugin instance

### Usage in Navigation Logic

```brightscript
' File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/carousel/common/sdcNavigation.bs
sub handleNavigationStart()
    ' Disable focus navigation during animation
    m.plugins.focus.enableFocusNavigation(false)
end sub

sub handleNavigationEnd()
    ' Re-enable focus navigation
    m.plugins.focus.enableFocusNavigation(true)
    
    ' Set focus to specific widget
    m.plugins.focus.setFocus("targetCard")
end sub
```

## Best Practices

### 1. Focus State Management

Always handle focus state changes visually. The plugin automatically updates `viewModelState.isFocused`:

```brightscript
focus: {
    onFocusChanged: sub(isFocused as boolean)
        ' Update visual appearance
        if isFocused
            m.node.blendColor = "0xFF0000FF"
            m.node.opacity = 1.0
        else
            m.node.blendColor = "0xFFFFFFFF"
            m.node.opacity = 0.7
        end if
        
        ' viewModelState.isFocused is automatically set to match isFocused parameter
        ' You can access it elsewhere: m.viewModelState.isFocused
    end sub
}
```

### 2. Group Organization

Organize focus groups logically based on UI layout:

```brightscript
' Main content area
{
    id: "mainContent",
    focus: {
        group: {
            defaultFocusId: "primaryButton",
            left: "sidebar",
            right: "details"
        }
    }
}
```

### 3. Error Handling

Always check for valid widgets before setting focus:

```brightscript
sub setFocusToWidget(widgetId as string)
    widget = m.getWidget(widgetId)
    if widget <> invalid
        widget.plugins.focus.setFocus(true)
    end if
end sub
```

### 4. Performance Considerations

- Use `enableSpatialNavigation: false` for precise control
- Avoid complex focus chains that could cause loops
- Use static navigation for predictable behavior

## Common Pitfalls

1. **Focus Loops**: Avoid circular navigation references
2. **Missing Default Focus**: Always specify `defaultFocusId` for groups
3. **Disabled Items**: Check `isEnabled` before setting focus
4. **Native Focus Conflicts**: Be careful mixing native and plugin focus
5. **Group Hierarchy**: Ensure proper parent-child relationships

## Debugging

Enable debug logging to trace focus behavior:

```brightscript
#if debug
    print "[FOCUS] Setting focus to: " + widgetId
    print "[FOCUS] Current focused widget: " + m.plugins.focus.getFocusedWidget().id
#end if
```


---

## 📚 Learn More

**NEXT STEP: [Internationalization support](./i18n-support.md)**

**Reference Documentation:**
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
