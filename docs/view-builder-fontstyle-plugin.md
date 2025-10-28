# FontStyle Configuration

<div style="display:flex; justify-content:space-between; align-items:center;">
  <span>← <a href="../README.md#-learn-more">README.md</a></span>
  <span><a href="./ai/view-builder-fontstyle-plugin.opt.yaml">🌱</a></span>
</div>

## Overview

The FontStyle Plugin provides declarative font management for Label nodes. It enables automatic font styling through a `fontStyle` configuration, supporting static font objects, function expressions, and dynamic values (using `@` operator for variable interpolation).

**Important**: FontStyle only applies to Label nodes. Non-Label widgets will ignore fontStyle configuration.

## Config Value Types

| Type | Description | Example |
|------|-------------|---------|
| Object | Static font configuration with uri and size | `{ uri: "pkg:/fonts/Roboto-Bold.ttf", size: 32 }` |
| Function Expression | Dynamic expression computed from state | `function() as object` |
| Variable Reference | String with `@` operator referencing viewModelState | `"@currentFontStyle"` |

### Font Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `uri` | string | Yes | Path to font file (e.g., "pkg:/fonts/Roboto-Regular.ttf") |
| `size` | integer | Yes | Font size in pixels |

### Font Value Examples

```brightscript
{
    nodeType: "Label",

    ' Object - static font configuration
    fontStyle: {
        uri: "pkg:/fonts/Roboto-Bold.ttf",
        size: 32
    },

    ' Variable reference - from viewModelState
    fontStyle: "@headerFontStyle",

    ' Function expression - dynamic based on state
    fontStyle: function() as object typecast m as Rotor.Widget
        if m.viewModelState.isFocused
            return UI.fontStyles.H1_aa
        else
            return UI.fontStyles.body_aa
        end if
    end function
}
```

### Type Safety with Typecast (Optional)

The `typecast` statement is a BrighterScript V1 feature that provides type information to the language server and IDE. It is **entirely optional** and has no runtime effect - it only improves development experience.
Type examples: `Rotor.Widget`, `Rotor.ViewModel`, or any class that extends them.

**Benefits:**
- **IDE Autocomplete**: Enables IntelliSense/autocomplete for widget methods and properties
- **Type Safety**: Catches type errors during development before runtime
- **Documentation**: Makes code intent clearer for other developers


## Lifecycle Integration

The FontStyle Plugin operates automatically through widget lifecycle:

| Lifecycle Hook | Purpose |
|----------------|---------|
| `beforeMount` | Apply initial font style to Label node |
| `beforeUpdate` | Reapply font style when fontStyle property updates |

### Font Application Process

1. **Node Type Check**: Plugin verifies widget is a Label node
2. **Value Resolution**: Determines if value is Object, Function Expression, or Variable Reference
3. **Expression Execution**: Function expressions executed in widget scope with access to `m`
4. **Variable Interpolation**: `@` operator patterns resolved from `viewModelState`
5. **Font Application**: Creates SceneGraph Font node and applies to Label
6. **Update Handling**: Font reapplied when fontStyle updates

## Common Patterns

### Typography System

Define consistent font styles in your theme:

```brightscript
' Theme configuration
UI.fontStyles = {
    H1_aa: {
        uri: "pkg:/fonts/Roboto-Bold.ttf",
        size: 48
    },
    H2_aa: {
        uri: "pkg:/fonts/Roboto-Bold.ttf",
        size: 36
    },
    body_aa: {
        uri: "pkg:/fonts/Roboto-Regular.ttf",
        size: 18
    },
    caption_aa: {
        uri: "pkg:/fonts/Roboto-Regular.ttf",
        size: 14
    }
}

' Use in widgets
{
    nodeType: "Label",
    fontStyle: UI.fontStyles.H2_aa,
    fields: {
        text: "Page Title"
    }
}
```

### Dynamic Font Based on State

```brightscript
{
    nodeType: "Label",
    fontStyle: function() as object
        if m.props.isTitle
            return UI.fontStyles.H1_aa
        else if m.props.isSubtitle
            return UI.fontStyles.H2_aa
        else
            return UI.fontStyles.body_aa
        end if
    end function,
    fields: {
        text: m.props.text
    }
}
```

### Variable Reference from ViewModel

```brightscript
' In ViewModel
override sub onCreateView()
    m.viewModelState.currentFontStyle = UI.fontStyles.H2_aa
end sub

' In widget template
{
    nodeType: "Label",
    fontStyle: "@currentFontStyle",
    fields: {
        text: "Dynamic Font"
    }
}
```

### Component-Specific Font Styling

```brightscript
' Theme component styles
UI.components = {
    buttons: {
        simpleButton: {
            fontStyle_aa: {
                uri: "pkg:/fonts/Roboto-Medium.ttf",
                size: 16
            }
        }
    },
    pageMenu: {
        fontStyle_aa: {
            uri: "pkg:/fonts/Roboto-Regular.ttf",
            size: 18
        }
    }
}

' Button widget
{
    id: "buttonLabel",
    nodeType: "Label",
    fontStyle: UI.components.buttons.simpleButton.fontStyle_aa,
    fields: {
        text: m.props.text,
        horizAlign: "center"
    }
}
```

### Focus-Dependent Font Sizing

```brightscript
{
    nodeType: "Label",
    fontStyle: function() as object
        baseFont = {
            uri: "pkg:/fonts/Roboto-Medium.ttf",
            size: m.viewModelState.isFocused ? 24 : 18
        }
        return baseFont
    end function,
    fields: {
        text: m.props.itemText
    }
}
```

## Best Practices

### 1. Use Predefined Font Styles

Create and maintain a consistent typography system:

```brightscript
' Good: Use predefined styles for consistency
fontStyle: UI.fontStyles.H2_aa

' Avoid: Hardcoded font definitions everywhere
fontStyle: {
    uri: "pkg:/fonts/Roboto-Bold.ttf",
    size: 36
}
```

### 2. Use Function Expressions for Complex Logic

```brightscript
' Good: Clear conditional logic
fontStyle: function() as object
    if m.props.isHighlighted
        return UI.fontStyles.highlighted_aa
    else
        return UI.fontStyles.default_aa
    end if
end function

' Less clean: Multiple static assignments
' (Would require managing fontStyle updates manually)
```

## Common Pitfalls

1. **Non-Label Nodes**: FontStyle only works with Label nodes
   - Solution: Ensure widget `nodeType` is "Label"

2. **Missing Font Files**: Font file doesn't exist at specified URI
   - Solution: Verify font files are in `pkg:/fonts/` directory

3. **Invalid Font Format**: Using unsupported font format
   - Solution: Use TTF fonts supported by Roku

4. **Function Context**: Function expressions need proper widget scope
   - Solution: Use `typecast m as Rotor.Widget` if needed

5. **Memory Overhead**: Creating new font objects unnecessarily
   - Solution: Reuse predefined font style objects

## Troubleshooting

### Font Not Applying

```brightscript
' Debug font style application
sub debugFontStyle(widget as object)
    print "Widget ID: " + widget.id
    print "Node Type: " + widget.nodeType
    print "Font Style: " + FormatJson(widget.fontStyle)

    if widget.node <> invalid and widget.node.font <> invalid
        print "Applied Font Size: " + widget.node.font.size.toStr()
        print "Applied Font URI: " + widget.node.font.uri
    else
        print "Font not applied - check node type and font file"
    end if
end sub
```

### Variable Interpolation Issues

- **Check variable exists**: Ensure variable is in `viewModelState`
- **Verify syntax**: Use `@variableName` format correctly
- **Check scope**: Variables resolve from widget's `viewModelState`
- **Debug resolution**: Print `viewModelState` to verify structure

### Performance Issues

- **Profile font loading**: Use Roku debugging tools to monitor font performance
- **Limit font variety**: Stick to essential font files (2-4 fonts maximum)
- **Cache font styles**: Store computed font objects in theme configuration
- **Preload fonts**: Include fonts in app package, avoid dynamic loading

## Font File Management

### Recommended Font Structure

```
pkg:/fonts/
   Roboto-Regular.ttf    # Body text, captions
   Roboto-Medium.ttf     # Buttons, emphasis
   Roboto-Bold.ttf       # Headers, titles
```

### Font Loading Best Practices

- **Test on device**: Always test fonts on actual Roku devices
- **Consider safe areas**: Account for TV overscan in font sizing
- **Screen resolution**: Test different screen sizes (HD, FHD, 4K)
- **Reading distance**: TV viewing distance affects optimal font sizes (larger than desktop/mobile)

---

## 📚 Learn More

**NEXT STEP: [Observer Plugin](./view-builder-observer-plugin.md)**

**Reference Documentation:**
- [ViewBuilder Overview](./view-builder-overview.md) - High-level architecture and concepts
- [Widget Reference](./view-builder-widget-reference.md) - Complete Widget properties, methods, and usage patterns
- [ViewModel Reference](./view-builder-viewmodel-reference.md) - Complete ViewModel structure, lifecycle, and state management

**Plugin Documentation:**
- [Fields Plugin](./view-builder-fields-plugin.md) - Field management with expressions and interpolation
- [Observer Plugin](./view-builder-observer-plugin.md) - Field observation patterns
- [Focus Plugin](./view-builder-focus-plugin.md) - Focus management and navigation

**Additional Documentation:**
- [Cross-Thread MVI design pattern](./cross-thread-mvi.md) - State management across threads
- [Internationalization support](./i18n-support.md) - Locale-aware interface implementation
