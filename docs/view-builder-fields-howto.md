# Rotor Framework Fields Plugin - How-To Guide

← [Back to Documentation](../README.md#-learn-more)

## Overview

The Fields Plugin is a fundamental component of the Rotor Framework that provides declarative field management for SceneGraph nodes. It enables setting and updating node properties through a declarative `fields` configuration, supporting static values, dynamic functions, and variable interpolation from the widget's state. This plugin forms the backbone of reactive UI updates in the Rotor Framework.

## Key Features

- **Declarative Field Setting**: Set SceneGraph node properties through declarative configuration
- **Dynamic Functions**: Support for functions that compute field values dynamically
- **Variable Interpolation**: Reference widget state and props using `@variable` syntax
- **Automatic Updates**: Fields are automatically updated when widget state changes
- **Lifecycle Integration**: Automatic field management through widget mount/update/destroy cycles
- **Expression Support**: Complex expressions and computed values for responsive UIs
- **State Binding**: Direct binding to `viewModelState` and widget properties

## Basic Usage

### 1. Static Field Values

Set static values directly on SceneGraph node fields:

```brightscript
// Basic static field configuration
{
    nodeType: "Label",
    fields: {
        text: "Hello World",
        color: "#FFFFFF",
        width: 200,
        height: 50
    }
}
```

### 2. Dynamic Field Values with Functions

Use functions to compute field values based on current state:

```brightscript
// Dynamic field values using functions
{
    nodeType: "Rectangle",
    fields: {
        width: function() as integer
            return m.props.isExpanded ? 400 : 200
        end function,
        color: function() as string
            if m.viewModelState.isFocused
                return "#FF0000"
            else
                return "#FFFFFF"
            end if
        end function
    }
}
```

## Configuration Properties

### Field Value Types

| Type | Description | Example |
|------|-------------|---------|
| Static Value | Direct assignment to node field | `text: "Hello World"` |
| Function | Dynamic computation based on state | `function() as string` |
| Variable Reference | Reference to widget state using `@` | `text: "@currentTitle"` |
| Template String | String interpolation with variables | `text: \`@l10n.menuItems.${m.props.pageKey}.text\`` |

### Field Processing Rules

| Pattern | Source | Description | Example |
|---------|--------|-------------|---------|
| Static | Direct value | Assigns value directly to node field | `width: 100` |
| Function | Function execution | Executes function in widget scope | `function() as integer` |
| `@variable` | `viewModelState` | References widget's viewModelState property | `@currentText` |
| Template | String interpolation | Processes template literals with variables | `\`${m.props.count} items\`` |

## Common Usage Patterns

### 1. Button with Dynamic Styling

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/buttons/simpleButton.bs
{
    id: "buttonLabel",
    nodeType: "Label",
    fontStyle: UI.components.buttons.simpleButton.fontStyle_aa,
    fields: {
        enableRenderTracking: true,
        text: m.props.text ?? m.getViewModel().id,
        color: UI.components.buttons.simpleButton.textColor,
        horizAlign: m.props.horizAlign ?? "center",
        vertAlign: m.props.vertAlign ?? "center",
        width: m.props.autoWidth ? 0 : m.props.width - 2 * m.props.paddingX,
        height: m.props.height,
        translation: [m.props.paddingX, 0]
    }
}
```

### 2. Menu Item with Focus-Dependent Fields

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/layout/pageMenu/pageMenuItem.bs
{
    id: "itemLabel",
    nodeType: "Label",
    fontStyle: UI.components.pageMenu.fontStyle_aa,
    fields: {
        color: function() as string
            if m.viewModelState.isFocused
                return UI.components.pageMenu.textColor.focused
            else
                return m.props.isActive ? UI.components.pageMenu.textColor.active : UI.components.pageMenu.textColor.default
            end if
        end function,
        text: `@l10n.menuItems.${m.props.optionKey}.text`,
        width: m.props.width ?? UI.components.pageMenu.labelWidth,
        height: UI.components.pageMenu.labelHeight,
        vertAlign: "center"
    }
}
```

### 3. Icon with Dynamic Translation

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/layout/pageMenu/pageMenuItem.bs
{
    id: "itemIcon",
    nodeType: "Poster",
    fields: {
        blendColor: function() as string
            if m.viewModelState.isFocused
                return UI.components.pageMenu.textColor.focused
            else
                return m.props.isActive ? UI.components.pageMenu.textColor.active : UI.components.pageMenu.textColor.default
            end if
        end function,
        width: UI.components.pageMenu.icon.size.width,
        height: UI.components.pageMenu.icon.size.height,
        uri: (UI.components.pageMenu.menuIcons_aa)[m.props.optionKey].url,
        translation: function() as object
            return [UI.components.pageMenu.labelWidth + UI.components.pageMenu.marginRight, 0]
        end function
    }
}
```

### 4. Page Title with Variable Interpolation

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/pages/home/homePage.bs
{
    id: "viewTitle",
    nodeType: "Label",
    fontStyle: UI.fontStyles.H2_aa,
    fields: {
        color: UI.colors.white,
        text: `@l10n.menuItems.${m.props.pageKey}.text`
    }
}, {
    nodeType: "Label",
    fontStyle: UI.fontStyles.hintText_aa,
    fields: {
        color: UI.colors.primary_2,
        text: `${m.props.cardCount} Titles to Browse`
    }
}
```

## Advanced Features

### 1. Complex Function-Based Fields

Use functions for complex computed values:

```brightscript
{
    nodeType: "LayoutGroup",
    fields: {
        translation: function() as object
            if Rotor.Utils.isArray(m.props.translation)
                return m.props.translation
            else
                marginBottom = UI.components.pageMenu.marginBottom
                return [0, m.props.optionIndex * (UI.components.pageMenu.labelHeight + (marginBottom ?? 0))]
            end if
        end function,
        itemSpacings: function() as object
            return m.props.isVertical ? [0, 10] : [10, 0]
        end function
    }
}
```

### 2. Variable Interpolation with State

Reference viewModelState properties using `@` syntax:

```brightscript
// In ViewModel
override sub onCreateView()
    m.viewModelState.currentTitle = "Home Page"
    m.viewModelState.itemCount = 5
    m.viewModelState.isLoading = false
end sub

// In widget template
{
    nodeType: "Label",
    fields: {
        text: "@currentTitle",  // References viewModelState.currentTitle
        visible: function() as boolean
            return not m.viewModelState.isLoading
        end function
    }
}
```

### 3. Template String Interpolation

Combine variables and expressions in string templates:

```brightscript
{
    nodeType: "Label",
    fields: {
        text: `@l10n.menuItems.${m.props.optionKey}.text`,  // i18n with dynamic key
        description: `Loading ${m.props.itemCount} items...`,  // Dynamic count
        status: `@currentUser.name - @currentUser.role`  // Multiple variables
    }
}
```

### 4. Conditional Field Values

Use conditional logic within field functions:

```brightscript
{
    nodeType: "Poster",
    fields: {
        uri: function() as string
            if m.props.imageUrl <> ""
                return m.props.imageUrl
            else
                return "pkg:/images/placeholder.png"
            end if
        end function,
        blendColor: function() as string
            return m.viewModelState.isSelected ? "#FF0000FF" : "#FFFFFFFF"
        end function,
        opacity: function() as float
            return m.props.isEnabled ? 1.0 : 0.5
        end function
    }
}
```

### 5. Array and Object Field Values

Set complex data structures as field values:

```brightscript
{
    nodeType: "LayoutGroup",
    fields: {
        translation: [100, 200],  // Static array
        itemSpacings: function() as object
            spacings = []
            for i = 0 to m.props.itemCount - 1
                spacings.push(i * 10)
            end for
            return spacings
        end function
    }
}
```

## Plugin Methods

The Fields Plugin operates automatically through the widget lifecycle - no manual methods are required for basic usage.

### Plugin Lifecycle Integration

| Lifecycle Hook | When Called | Purpose |
|----------------|-------------|---------|
| `beforeMount` | Before widget is mounted | Parse and apply initial field values |
| `beforeUpdate` | Before widget updates | Extend existing fields with new values and reapply |
| `beforeDestroy` | Before widget is destroyed | Clear field references to prevent memory leaks |

### Field Processing Pipeline

1. **Field Collection**: Plugin processes all fields from widget configuration
2. **Value Resolution**: For each field, determines if value is static, function, or variable reference
3. **Function Execution**: Functions are executed in widget scope context with access to `m`
4. **Variable Interpolation**: `@variable` patterns are resolved from `viewModelState`
5. **Template Processing**: String templates are processed with variable substitution
6. **Field Application**: Final values are applied to the SceneGraph node using `setCustomFields`
7. **Update Handling**: Fields are re-evaluated when widget updates occur

## Best Practices

### 1. Use Functions for Dynamic Values

Prefer functions over static values when fields depend on state:

```brightscript
// Good: Dynamic based on state
fields: {
    color: function() as string
        return m.viewModelState.isActive ? "#FF0000" : "#FFFFFF"
    end function
}

// Avoid: Static values that should be dynamic
fields: {
    color: "#FFFFFF"  // Won't update when state changes
}
```

### 2. Leverage Variable Interpolation

Use `@` syntax for clean state references:

```brightscript
// Good: Clean variable reference
fields: {
    text: "@currentMessage"
}

// Less clean: Function for simple variable access
fields: {
    text: function() as string
        return m.viewModelState.currentMessage
    end function
}
```

### 3. Keep Functions Lightweight

Field functions are called during rendering - keep them fast:

```brightscript
// Good: Simple, fast computation
fields: {
    width: function() as integer
        return m.props.isExpanded ? 400 : 200
    end function
}

// Avoid: Heavy computation in field functions
fields: {
    complexValue: function() as object
        ' Avoid expensive operations here
        result = performComplexCalculation()  // Bad
        return result
    end function
}
```

### 4. Handle State Dependencies

Ensure viewModelState properties exist before referencing:

```brightscript
// In ViewModel - Initialize state
override sub onCreateView()
    m.viewModelState.title = "Default Title"
    m.viewModelState.isVisible = true
end sub

// In template - Safe to reference
fields: {
    text: "@title",
    visible: "@isVisible"
}
```

## Common Pitfalls

1. **Undefined Variable References**: Referencing `@variables` that don't exist in viewModelState
2. **Heavy Field Functions**: Expensive computations in field functions cause performance issues
3. **Circular Dependencies**: Functions that depend on the field they're setting
4. **Context Issues**: Functions not having proper access to widget scope (`m`)
5. **Type Mismatches**: Returning wrong data types from field functions
6. **Memory Leaks**: Storing references to large objects in field closures

## Troubleshooting

### Fields Not Updating

```brightscript
// Debug field application
sub debugFields(widget as object)
    print "Widget ID: " + widget.id
    print "Node Type: " + widget.nodeType
    print "Fields Config: " + FormatJson(widget.fields)
    
    // Check if node exists
    if widget.node <> invalid
        print "Node fields applied successfully"
        // Check specific field values
        if widget.node.hasField("text")
            print "Text field value: " + widget.node.text
        end if
    else
        print "ERROR: Widget node is invalid"
    end if
end sub
```

### Variable Interpolation Issues

- **Check viewModelState**: Ensure variables exist in `viewModelState`
- **Verify syntax**: Use `@variableName` format correctly
- **Check scope**: Variables are resolved from widget's `viewModelState` only
- **Debug variable resolution**: Print viewModelState contents to verify structure

### Function Execution Problems

- **Check function signature**: Ensure functions return correct types
- **Verify scope access**: Functions should have access to widget context (`m`)
- **Handle edge cases**: Check for invalid or undefined values
- **Test function isolation**: Test field functions independently

## Field Integration Patterns

### With Focus Plugin

```brightscript
{
    nodeType: "Button",
    focus: {
        onFocusChanged: sub(isFocused)
            // Focus plugin updates viewModelState.isFocused
        end sub
    },
    fields: {
        color: function() as string
            // React to focus state changes
            if m.viewModelState.isFocused
                return UI.colors.focused
            else
                return UI.colors.default
            end if
        end function
    }
}
```

### With Observer Plugin

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
            // Respond to field changes applied by fields plugin
            print "Text field updated to: " + payload.text
        end sub
    }
}
```

### With FontStyle Plugin

```brightscript
{
    nodeType: "Label",
    fontStyle: UI.fontStyles.H2_aa,
    fields: {
        text: "@currentTitle",
        color: function() as string
            if m.viewModelState.isHighlighted
                return UI.colors.highlight
            else
                return UI.colors.text
            end if
        end function
    }
}
```

## Advanced Field Patterns

### 1. Computed Properties Pattern

```brightscript
// ViewModel with computed properties
override sub onCreateView()
    ' Set up computed properties
    m.viewModelState.itemCount = 10
    m.viewModelState.pageSize = 5
    
    ' Computed property function
    m.computedProps = {
        pageCount: function() as integer
            return Int(m.viewModelState.itemCount / m.viewModelState.pageSize)
        end function
    }
end sub

// Widget using computed properties
{
    nodeType: "Label",
    fields: {
        text: function() as string
            return "Page 1 of " + m.computedProps.pageCount().toStr()
        end function
    }
}
```

### 2. State Machine Fields

```brightscript
// State-driven field values
{
    nodeType: "Group",
    fields: {
        visible: function() as boolean
            return m.viewModelState.currentState = "visible"
        end function,
        opacity: function() as float
            states = {
                hidden: 0.0,
                loading: 0.5,
                visible: 1.0
            }
            return states[m.viewModelState.currentState] ?? 1.0
        end function
    }
}
```

### 3. Responsive Layout Fields

```brightscript
// Responsive field values based on screen size
{
    nodeType: "LayoutGroup",
    fields: {
        layoutDirection: function() as string
            screenWidth = m.getFramework().getInfo().device.screenSize.width
            return screenWidth > 1280 ? "horizontal" : "vertical"
        end function,
        itemSpacings: function() as object
            screenWidth = m.getFramework().getInfo().device.screenSize.width
            spacing = screenWidth > 1280 ? 20 : 10
            return [spacing, spacing]
        end function
    }
}
```

