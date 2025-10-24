# Rotor Framework FontStyle Plugin - How-To Guide

← [Back to Documentation](../README.md#-learn-more)

## Overview

The FontStyle Plugin is a declarative font management component of the Rotor Framework that provides automatic font styling for Label nodes. It simplifies typography by allowing you to define font styles declaratively and automatically applying them to Label elements with support for dynamic styling, variable interpolation, and lifecycle management.

## Key Features

- **Automatic Font Application**: Automatically applies font styles to Label nodes
- **Dynamic Font Styling**: Support for functions and expressions for responsive fonts
- **Variable Interpolation**: Replace variables in font style definitions using `@variable` syntax
- **Typography Hierarchy**: Predefined font styles for consistent design systems
- **Lifecycle Integration**: Automatic font updates during widget lifecycle
- **Performance Optimized**: Efficient font caching and application

## Basic Usage

### 1. Simple Font Style Application

Apply font styles directly to Label widgets:

```brightscript
// Basic font style with explicit properties
{
    nodeType: "Label",
    fontStyle: {
        uri: "pkg:/fonts/Roboto-Regular.ttf",
        size: 24
    },
    fields: {
        text: "Hello World",
        color: "#FFFFFF"
    }
}
```

### 2. Using Predefined Font Styles

The recommended approach using predefined UI system fonts:

```brightscript
// Using predefined font styles for consistency
{
    nodeType: "Label",
    fontStyle: UI.fontStyles.H2_aa,
    fields: {
        text: "Page Title",
        color: UI.colors.white
    }
}
```

## Configuration Properties

### Font Style Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `uri` | string | Yes | Path to the font file (e.g., "pkg:/fonts/Roboto-Regular.ttf") |
| `size` | integer | Yes | Font size in pixels |

### Font Style Types

| Type | Description | Example |
|------|-------------|---------|
| Object | Static font configuration | `{ uri: "pkg:/fonts/Roboto-Bold.ttf", size: 32 }` |
| Function | Dynamic font based on state | `function() as object` |
| Variable | Reference to viewModelState property | `"@currentFontStyle"` |

## Common Usage Patterns

### 1. Typography Hierarchy

```brightscript
// File: assetsJs/theme.js - Font style definitions
fontStyles: {
    H1_aa: {
        uri: "pkg:/fonts/Roboto-Bold.ttf",
        size: 48
    },
    H2_aa: {
        uri: "pkg:/fonts/Roboto-Bold.ttf", 
        size: 36
    },
    H3_aa: {
        uri: "pkg:/fonts/Roboto-Medium.ttf",
        size: 28
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
```

### 2. Button Component Font Styling

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/buttons/simpleButton.bs
{
    id: "buttonLabel",
    nodeType: "Label",
    fontStyle: UI.components.buttons.simpleButton.fontStyle_aa,
    fields: {
        text: m.props.text,
        color: UI.components.buttons.simpleButton.textColor,
        horizAlign: "center",
        vertAlign: "center"
    }
}
```

### 3. Menu Item with Focus-Dependent Styling

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
                return UI.components.pageMenu.textColor.default
            end if
        end function,
        text: `@l10n.menuItems.${m.props.optionKey}.text`
    }
}
```

### 4. Page Title with Subtitle

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/pages/homePage.bs
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

### 1. Dynamic Font Styles with Functions

Use functions for responsive or state-dependent fonts:

```brightscript
{
    nodeType: "Label",
    fontStyle: function() as object
        if m.props.isHighlighted
            return UI.fontStyles.H1_aa
        else
            return UI.fontStyles.body_aa
        end if
    end function,
    fields: {
        text: "Dynamic Font Label"
    }
}
```

### 2. Responsive Font Sizing

```brightscript
{
    nodeType: "Label",
    fontStyle: function() as object
        deviceInfo = m.getFramework().getInfo().device
        if deviceInfo.modelDisplayName = "4K"
            return {
                uri: "pkg:/fonts/Roboto-Regular.ttf",
                size: 32
            }
        else
            return {
                uri: "pkg:/fonts/Roboto-Regular.ttf", 
                size: 24
            }
        end if
    end function,
    fields: {
        text: "Responsive Font"
    }
}
```

### 3. Variable Interpolation

Reference viewModelState properties using `@` syntax:

```brightscript
// In your ViewModel
override sub onCreateView()
    m.viewModelState.currentTheme = "dark"
    m.viewModelState.fontConfig = {
        uri: "pkg:/fonts/Roboto-Regular.ttf",
        size: 20
    }
end sub

// In your template
{
    nodeType: "Label",
    fontStyle: "@fontConfig",  // Uses viewModelState.fontConfig
    fields: {
        text: "Theme-based Font"
    }
}
```

### 4. Scaled Font Sizes

```brightscript
{
    nodeType: "Label",
    fontStyle: function() as object
        baseStyle = UI.fontStyles.body_aa
        scaleFactor = m.props.fontScale ?? 1.0
        
        return {
            uri: baseStyle.uri,
            size: Int(baseStyle.size * scaleFactor)
        }
    end function,
    fields: {
        text: "Scalable Font"
    }
}
```

## Plugin Methods

FontStyle Plugin is automatically applied during widget lifecycle - no manual methods are required for basic usage.

### Plugin Lifecycle Integration

| Lifecycle Hook | When Called | Purpose |
|----------------|-------------|---------|
| `beforeMount` | Before widget is mounted | Apply initial font style |
| `beforeUpdate` | Before widget updates | Reapply font style with new values |

### Font Application Process

1. **Widget Detection**: Plugin checks if widget is a Label node
2. **Style Resolution**: Resolves font style value (function, variable, or object)
3. **Variable Interpolation**: Processes any `@variable` references from viewModelState
4. **Font Creation**: Creates SceneGraph Font node with uri and size
5. **Font Application**: Applies font to Label node
6. **Updates**: Automatically reapplies font when widget updates

## Best Practices

### 1. Use Predefined Font Styles

Create and use a consistent typography system:

```brightscript
// Good: Use predefined styles for consistency
fontStyle: UI.fontStyles.H2_aa

// Avoid: Hardcoded font definitions everywhere
fontStyle: {
    uri: "pkg:/fonts/Roboto-Bold.ttf",
    size: 36
}
```

### 2. Component-Specific Font Organization

```brightscript
// Organize font styles by component in theme system
UI.components = {
    buttons: {
        simpleButton: {
            fontStyle_aa: { uri: "pkg:/fonts/Roboto-Medium.ttf", size: 16 }
        }
    },
    pageMenu: {
        fontStyle_aa: { uri: "pkg:/fonts/Roboto-Regular.ttf", size: 18 }
    }
}
```

### 3. Performance Considerations

- **Minimize font variety**: Use fewer font files for better performance
- **Preload fonts**: Include essential fonts in your app package
- **Cache font objects**: Roku automatically caches font files
- **Avoid frequent font changes**: Font application has performance cost

### 4. Accessibility Support

```brightscript
{
    nodeType: "Label",
    fontStyle: function() as object
        theme = m.getDispatcher("theme").getState().currentTheme
        
        if theme = "accessibility"
            return UI.fontStyles.accessible_aa  // Larger, high-contrast fonts
        else
            return UI.fontStyles.default_aa
        end if
    end function
}
```

## Common Pitfalls

1. **Non-Label Nodes**: FontStyle only works with Label nodes
2. **Missing Font Files**: Ensure font files exist at specified URIs
3. **Invalid Font Format**: Use TTF fonts supported by Roku
4. **Variable Scope**: Variables are resolved from widget's viewModelState only
5. **Function Context**: Ensure `m` context is available in font style functions
6. **Memory Leaks**: Avoid creating new font objects unnecessarily

## Troubleshooting

### Font Not Applying

```brightscript
// Debug font style application
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

- **Check variable path**: Ensure variable exists in viewModelState
- **Verify syntax**: Use `@variableName` format correctly
- **Check scope**: Variables are resolved from widget's viewModelState

### Performance Issues

- **Profile font loading**: Use Roku debugging tools to monitor font performance
- **Limit font variety**: Stick to essential font files
- **Cache font styles**: Store computed font objects when possible

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
- **Screen resolution**: Consider different screen sizes and resolutions
- **Reading distance**: TV viewing distance affects optimal font sizes

