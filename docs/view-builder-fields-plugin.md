# Fields Configuration

[← README.md](../README.md#-learn-more) | [🌱](./ai/view-builder-fields-plugin.opt.yaml)

## Overview

The Fields Plugin provides declarative field management for SceneGraph nodes. It enables setting and updating node properties through a `fields` configuration, supporting static values, function expressions, and dynamic values (using `@` operator and string interpolation).

## Config Value Types

| Type | Description | Example |
|------|-------------|---------|
| Static Value | Direct assignment to node field | `text: "Hello World"` |
| Function Expression | Dynamic expression computed from state | `function() as string` |
| Dynamic Value | String with `@` operator, interpolation, or both | See examples below |

### Dynamic Value Examples

```brightscript
fields: {
    ' @ operator - reference viewModelState property
    title: "@currentTitle",
    status: "@userStatus",

    ' String interpolation - embed expressions
    count: `${m.props.itemCount} items`,
    message: `Score: ${m.props.score} points`,

    ' Combined - mix @ operator and interpolation
    greeting: `Hello @userName, you have ${m.props.unreadCount} messages`,
    path: `@l10n.menu.${m.props.pageKey}.title`,
    display: `@currentUser - Level ${m.props.level} - @statusMessage`
}
```

## Static Fields

Set static values directly on SceneGraph node fields:

```brightscript
{
    id: "title",
    nodeType: "Label",
    fields: {
        text: "Welcome",
        color: "#FFFFFF",
        width: 300,
        height: 60,
        horizAlign: "center",
        vertAlign: "center"
    }
}
```

## Dynamic Fields with Function Expressions

Use function expressions to compute field values based on widget state:

```brightscript
{
    id: "statusLabel",
    nodeType: "Label",
    fields: {
        text: function() as string typecast m as Rotor.Widget
            if m.viewModelState.isLoading
                return "Loading..."
            else if m.viewModelState.hasError
                return "Error occurred"
            else
                return "Ready"
            end if
        end function,
        color: function() as string
            return m.viewModelState.hasError ? "#FF0000" : "#00FF00"
        end function
    }
}
```

### Type Safety with Typecast (Optional)

The `typecast` statement is a BrighterScript V1 feature that provides type information to the language server and IDE. It is **entirely optional** and has no runtime effect - it only improves development experience.
Type examples: `Rotor.Widget`, `Rotor.ViewModel`, or any class that extends them.

**Benefits:**
- **IDE Autocomplete**: Enables IntelliSense/autocomplete for widget methods and properties
- **Type Safety**: Catches type errors during development before runtime
- **Documentation**: Makes code intent clearer for other developers


**Function expressions have access to:**
- `m.viewModelState` - Shared state across ViewModel's widgets
- `m.props` - Shared props across ViewModel's widgets
- `m.*` - All widget instance properties and methods

## Variable Interpolation with @ Operator

Reference viewModelState properties using the `@` operator:

```brightscript
' In ViewModel
override sub onCreateView()
    m.viewModelState.userName = "John Doe"
    m.viewModelState.score = 1250
    m.viewModelState.isOnline = true
end sub

' In widget template
{
    nodeType: "Label",
    fields: {
        text: "@userName",           ' References viewModelState.userName
        visible: "@isOnline"          ' References viewModelState.isOnline
    }
}
```

## String Interpolation

Combine variables and expressions in strings:

```brightscript
{
    nodeType: "Label",
    fields: {
        ' Dynamic property access
        text: `@l10n.menu.${m.props.pageKey}`,

        ' Combining props
        description: `Score: ${m.props.score} points`,

        ' Multiple variable references
        status: `@userName - Level @currentLevel`
    }
}
```

## Lifecycle Integration

The Fields Plugin operates automatically through widget lifecycle:

| Lifecycle Hook | Purpose |
|----------------|---------|
| `beforeMount` | Parse and apply initial field values |
| `beforeUpdate` | Extend existing fields with new values and reapply |
| `beforeDestroy` | Clear field references to prevent memory leaks |

### Field Processing Pipeline

1. **Field Collection**: Plugin processes all fields from widget configuration
2. **Value Resolution**: Determines if value is static, function expression, or @ operator
3. **Expression Execution**: Function expressions executed in widget scope with access to `m`
4. **Variable Interpolation**: `@` operator patterns resolved from `viewModelState`
5. **String Interpolation**: Interpolated strings processed with variable substitution
6. **Field Application**: Final values applied to SceneGraph node
7. **Update Handling**: Fields re-evaluated when widget updates occur


## Common Patterns

### Button with Focus State

```brightscript
{
    id: "menuButton",
    nodeType: "Rectangle",
    fields: {
        width: 200,
        height: 60,
        color: function() as string
            if m.viewModelState.isFocused
                return "#FF5500"  ' Orange when focused
            else if m.props.isSelected
                return "#0055FF"  ' Blue when selected
            else
                return "#CCCCCC"  ' Gray default
            end if
        end function
    },
    children: [{
        nodeType: "Label",
        fields: {
            text: m.props.label,
            color: function() as string
                return m.viewModelState.isFocused ? "#FFFFFF" : "#000000"
            end function,
            horizAlign: "center",
            vertAlign: "center",
            width: 200,
            height: 60
        }
    }]
}
```

### List Item with Dynamic Content

```brightscript
{
    id: "listItem",
    nodeType: "Group",
    fields: {
        translation: function() as object
            ' Position based on index
            itemHeight = 80
            return [0, m.props.index * itemHeight]
        end function
    },
    children: [{
        nodeType: "Label",
        fields: {
            text: m.props.title,
            color: "#FFFFFF",
            width: 400,
            height: 60
        }
    }, {
        nodeType: "Label",
        fields: {
            text: function() as string
                return m.props.itemCount.toStr() + " items"
            end function,
            color: "#AAAAAA",
            width: 200,
            translation: [400, 0]
        }
    }]
}
```

### Image with Fallback

```brightscript
{
    id: "thumbnail",
    nodeType: "Poster",
    fields: {
        uri: function() as string
            if m.props.imageUrl <> invalid and m.props.imageUrl <> ""
                return m.props.imageUrl
            else
                return "pkg:/images/placeholder.png"
            end if
        end function,
        width: 300,
        height: 200,
        loadDisplayMode: "scaleToFit",
        opacity: function() as float
            return m.viewModelState.isLoading ? 0.5 : 1.0
        end function
    }
}
```

### Conditional Visibility

```brightscript
{
    id: "errorMessage",
    nodeType: "Label",
    fields: {
        text: "@errorText",
        color: "#FF0000",
        visible: function() as boolean
            return m.viewModelState.hasError = true
        end function
    }
}
```

## Array and Object Fields

Set complex data structures as field values:

```brightscript
{
    nodeType: "LayoutGroup",
    fields: {
        ' Static array
        translation: [100, 200],

        ' Dynamic array from function
        itemSpacings: function() as object
            return m.props.isVertical ? [0, 20] : [20, 0]
        end function,

        ' Dynamic layout direction
        layoutDirection: function() as string
            return m.props.isVertical ? "vert" : "horiz"
        end function
    }
}
```

## Best Practices

### Use Function Expressions for Dynamic Values

```brightscript
' Good: Dynamic based on state
fields: {
    color: function() as string
        return m.viewModelState.isActive ? "#FF0000" : "#FFFFFF"
    end function
}

' Avoid: Static value that should be dynamic
fields: {
    color: "#FFFFFF"  ' Won't update when state changes
}
```

### Prefer @ Operator for Simple References

```brightscript
' Good: Clean reference with @ operator
fields: {
    text: "@currentMessage"
}

' Less clean: Function expression for simple access
fields: {
    text: function() as string
        return m.viewModelState.currentMessage
    end function
}
```

### Keep Function Expressions Lightweight

```brightscript
' Good: Simple, fast computation
fields: {
    width: function() as integer
        return m.props.isExpanded ? 400 : 200
    end function
}

' Avoid: Heavy computation in function expressions
fields: {
    complexValue: function() as object
        ' Don't perform expensive operations during field evaluation
        result = performComplexCalculation()  ' Bad
        return result
    end function
}
```

## Integration with Other Plugins

### With Focus Plugin

```brightscript
{
    nodeType: "Rectangle",
    focus: {
        onFocusChanged: sub(isFocused)
            ' Focus plugin auto-updates viewModelState.isFocused
        end sub
    },
    fields: {
        color: function() as string
            ' React to focus state changes
            return m.viewModelState.isFocused ? "#FF5500" : "#CCCCCC"
        end function
    }
}
```

### With i18n

```brightscript
{
    nodeType: "Label",
    fields: {
        ' Direct translation reference
        text: "@l10n.welcomeMessage",

        ' Dynamic translation with template
        description: `@l10n.items.${m.props.itemType}.name`
    }
}
```

## Common Pitfalls

1. **Undefined Variable References**
   - Referencing `@variables` that don't exist in viewModelState
   - Solution: Initialize all state variables in `onCreateView()`

2. **Heavy Function Expressions**
   - Expensive computations in function expressions cause performance issues
   - Solution: Precompute values in state, reference with `@` operator

3. **Circular Dependencies**
   - Expressions that depend on the field they're setting
   - Solution: Carefully review expression dependencies

4. **Type Mismatches**
   - Returning wrong data types from function expressions
   - Solution: Use proper type annotations and validate return values

5. **Memory Leaks**
   - Storing references to large objects in expression closures
   - Solution: Keep expressions stateless, reference state via `m`

## Troubleshooting

### Fields Not Updating

```brightscript
' Debug field application
print "Widget ID: " + m.id
print "Node Type: " + m.nodeType

' Check if node exists
if m.node <> invalid
    ' Check specific field value
    if m.node.hasField("text")
        print "Text field value: " + m.node.text
    end if
else
    print "ERROR: Widget node is invalid"
end if

' Check viewModelState
print "viewModelState: " + FormatJson(m.viewModelState)
```

### @ Operator Issues

- **Check viewModelState**: Ensure variables exist
- **Verify syntax**: Use `@variableName` format correctly
- **Check scope**: `@` operator resolves from widget's `viewModelState` only
- **Debug resolution**: Print viewModelState to verify structure

### Expression Execution Problems

- **Check function signature**: Ensure correct return types
- **Verify scope access**: Expressions have access to widget context (`m`). You should use `typecast m as <Type>` statement.
- **Handle edge cases**: Check for invalid or undefined values
- **Test isolation**: Test function expressions independently

## Advanced Patterns

### Computed Properties

```brightscript
' In ViewModel
override sub onCreateView()
    m.viewModelState.itemCount = 10
    m.viewModelState.pageSize = 5
end sub

' In widget
{
    nodeType: "Label",
    fields: {
        text: function() as string
            totalPages = Int(m.viewModelState.itemCount / m.viewModelState.pageSize)
            return "Page 1 of " + totalPages.toStr()
        end function
    }
}
```

---

## 📚 Learn More

**NEXT STEP: [FontStyle Plugin](./view-builder-fontstyle-plugin.md)**

**Reference Documentation:**
- [ViewBuilder Overview](./view-builder-overview.md) - High-level architecture and concepts
- [Widget Reference](./view-builder-widget-reference.md) - Complete Widget properties, methods, and usage patterns
- [ViewModel Reference](./view-builder-viewmodel-reference.md) - Complete ViewModel structure, lifecycle, and state management

**Plugin Documentation:**
- [FontStyle Plugin](./view-builder-fontstyle-plugin.md) - Typography and font styling
- [Observer Plugin](./view-builder-observer-plugin.md) - Field observation patterns
- [Focus Plugin](./view-builder-focus-plugin.md) - Focus management and navigation

**Additional Documentation:**
- [Cross-Thread MVI design pattern](./cross-thread-mvi.md) - State management across threads
- [Internationalization support](./i18n-support.md) - Locale-aware interface implementation
