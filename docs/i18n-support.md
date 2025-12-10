# Internationalization (i18n) Support

[← README.md](../README.md#-learn-more) | [🌱](./ai/i18n-support.opt.yaml)

## Overview

The Rotor Framework provides built-in internationalization (i18n) support through the `I18nService`. The system enables multi-language applications with automatic locale management, translation loading, and variable interpolation.

## Key Features

- Multi-language support with nested translation structures
- Automatic ViewModel integration
- Variable interpolation with `@l10n` references
- Dynamic key path resolution
- Translation caching for performance

## Translation Setup

### Translation File Structure

Define translations in BrightScript associative arrays:

```brightscript
function getTranslations() as object
    return {
        "en_US": {
            "app": {
                "title": "My Application",
                "version": "1.0.0"
            },
            "navigation": {
                "home": "Home",
                "settings": "Settings",
                "about": "About"
            },
            "buttons": {
                "save": "Save",
                "cancel": "Cancel",
                "delete": "Delete"
            },
            "messages": {
                "welcome": "Welcome!",
                "loading": "Loading...",
                "error": "An error occurred"
            }
        },
        "es_ES": {
            "app": {
                "title": "Mi Aplicación",
                "version": "1.0.0"
            },
            "navigation": {
                "home": "Inicio",
                "settings": "Configuración",
                "about": "Acerca de"
            },
            "buttons": {
                "save": "Guardar",
                "cancel": "Cancelar",
                "delete": "Eliminar"
            },
            "messages": {
                "welcome": "¡Bienvenido!",
                "loading": "Cargando...",
                "error": "Ocurrió un error"
            }
        }
    }
end function
```

### Initializing Translations

Initialize translations during application startup:

```brightscript
sub init()
    m.framework = new Rotor.Framework()

    ' Load translations
    translations = getTranslations()
    currentLocale = "en_US"

    ' Set translations for current locale
    m.framework.i18nService.setL10n(translations[currentLocale])
end sub
```

## ViewModel Integration

### Basic Configuration

Configure i18n in ViewModel template to load specific translation sections:

```brightscript
class NavigationMenu extends Rotor.ViewModel

    override function template() as object
        return {
            nodeType: "Group",
            i18n: {
                path: "navigation"
            },
            children: [
                {
                    id: "homeLabel",
                    nodeType: "Label",
                    fields: {
                        text: m.viewModelState.l10n.home
                    }
                },
                {
                    id: "settingsLabel",
                    nodeType: "Label",
                    fields: {
                        text: m.viewModelState.l10n.settings
                    }
                }
            ]
        }
    end function
end class
```

### Advanced Configuration

Load multiple translation sections (merged into single l10n object):

```brightscript
{
    nodeType: "Group",
    i18n: {
        paths: ["navigation", "buttons"]
    },
    children: [
        {
            nodeType: "Label",
            fields: {
                ' Access merged sections at root level
                text: "@l10n.home"  ' From navigation
            }
        },
        {
            nodeType: "Label",
            fields: {
                text: "@l10n.save"  ' From buttons
            }
        }
    ]
}
```

**Note**: With `paths` (plural), all sections are merged at the root level of `@l10n`. Ensure keys don't conflict across sections.

### Accessing Locale and RTL Information

All widgets have built-in methods to access locale and RTL information dynamically:

```brightscript
override sub onCreateView()
    ' Get i18n service
    i18n = m.i18n()

    ' Get current locale string (e.g., "en_US", "ar_SA")
    currentLocale = i18n.getLocale()

    ' Check if current locale is RTL
    isRTL = i18n.getIsRtl()  ' false for LTR languages, true for RTL

    ' Use in conditional logic
    if i18n.getIsRtl()
        ' Apply RTL-specific layout
    else
        ' Apply LTR layout
    end if
end sub
```

These methods are available on all widgets and ViewModels, regardless of whether an `i18n` configuration is specified. They dynamically query the i18nService for the current locale state.

## Variable Interpolation

The `@l10n` scope depends on whether an `i18n` configuration is specified:

| Configuration | @l10n Scope | Example |
|---------------|-------------|---------|
| No `i18n` config | Full translation object | `@l10n.app.title` |
| `path: "app"` | Scoped to "app" section | `@l10n.title` |
| `paths: ["app", "buttons"]` | Merged sections at root | `@l10n.title` and `@l10n.save` |

### Static Key References

Use `@l10n` to reference translation keys in field values.

**Without i18n path** (full key path required):

```brightscript
{
    nodeType: "Label",
    fields: {
        text: "@l10n.app.title"  ' Full path: app.title
    }
}
```

**With i18n path** (scoped to path):

```brightscript
{
    nodeType: "Label",
    i18n: {
        path: "app"
    },
    fields: {
        text: "@l10n.title"  ' Scoped: only "title" (within "app")
    }
}
```

### Dynamic Key Paths

Build dynamic key paths using template strings and props:

```brightscript
class MenuItem extends Rotor.ViewModel

    override function template() as object
        return {
            nodeType: "Label",
            i18n: {
                path: "navigation"  ' Scopes @l10n to "navigation"
            },
            fields: {
                ' Dynamic key based on props (within "navigation" scope)
                text: `@l10n.${m.props.menuKey}`
            }
        }
    end function
end class

' Usage:
{
    viewModel: ViewModels.MenuItem,
    props: {
        menuKey: "home"  ' Resolves to navigation.home
    }
}
```

### Multiple References

Combine multiple translation references:

**Without path** (full paths):

```brightscript
{
    nodeType: "Label",
    fields: {
        text: `@l10n.app.title - @l10n.app.version`
    }
}
```

**With path** (scoped references):

```brightscript
{
    nodeType: "Label",
    i18n: {
        path: "app"
    },
    fields: {
        text: `@l10n.title - @l10n.version`  ' Both within "app" scope
    }
}
```

### Nested Interpolation

Access nested translation structures:

```brightscript
{
    nodeType: "Label",
    i18n: {
        path: "messages"
    },
    fields: {
        text: `@l10n.${m.props.messageType}.${m.props.severity}`
    }
}

' Translation structure:
' messages: {
'     user: {
'         info: "User information",
'         warning: "User warning"
'     },
'     system: {
'         info: "System information",
'         error: "System error"
'     }
' }
```

## Direct Access in Code

### Accessing Translations in ViewModels

Access translations directly in ViewModel logic. The `viewModelState.l10n` follows the same scoping rules as `@l10n`:

```brightscript
class ConfirmDialog extends Rotor.ViewModel

    override sub onCreateView()
        ' With i18n path: "dialog", l10n is scoped to dialog section
        titleText = m.viewModelState.l10n.title       ' dialog.title
        messageText = m.viewModelState.l10n.message   ' dialog.message

        ' Use in logic
        if m.props.showFullMessage
            m.displayMessage(titleText + ": " + messageText)
        end if
    end sub

    override function template() as object
        return {
            nodeType: "Group",
            i18n: {
                path: "dialog"  ' Scopes l10n to "dialog"
            },
            children: [
                {
                    nodeType: "Label",
                    fields: {
                        text: function() as string
                            if m.props.isError
                                return m.viewModelState.l10n.errorTitle
                            else
                                return m.viewModelState.l10n.title
                            end if
                        end function
                    }
                }
            ]
        }
    end function
end class
```

**Without i18n config**, access full path:

```brightscript
override sub onCreateView()
    ' No i18n config - full path required
    titleText = m.viewModelState.l10n.dialog.title
    buttonText = m.viewModelState.l10n.buttons.save
end sub
```

## I18nService API

### Core Methods

```brightscript
' Get framework i18n service
i18nService = m.framework.i18nService

' Get current locale
locale = i18nService.getLocale()  ' Returns "en_US"

' Get RTL status (auto-detected based on locale)
isRTL = i18nService.getIsRtl()  ' false for en_US, true for ar_SA

' Get entire l10n object
allTranslations = i18nService.getL10n()

' Get specific section
navigationTranslations = i18nService.getL10n("navigation")

' Get multiple sections merged
merged = i18nService.getL10n(["navigation", "buttons"])
```

### Setting Translations

```brightscript
' Set translations for locale
translations = getTranslations()
i18nService.setL10n(translations["en_US"])

' Extend existing translations
additionalTranslations = {
    "newSection": {
        "key": "value"
    }
}
i18nService.extendL10n(additionalTranslations)
```

## Widget Methods

All widgets and ViewModels have built-in methods for accessing locale information:

### getLocale()

Returns the current locale string from the i18nService.

```brightscript
' In any widget or ViewModel
currentLocale = m.getLocale()  ' Returns "en_US", "fr_FR", "ar_SA", etc.

' Use in conditional logic
override sub onCreateView()
    if m.getLocale() = "ja_JP"
        ' Apply Japanese-specific formatting
    end if
end sub

' Use in template field functions
{
    nodeType: "Label",
    fields: {
        text: function() as string
            return `Current locale: ${m.getLocale()}`
        end function
    }
}
```

### isRtl()

Returns a boolean indicating whether the current locale uses right-to-left text direction.

```brightscript
' In any widget or ViewModel
isRightToLeft = m.isRtl()  ' Returns true for ar, he, fa, ur locales

' Use for layout adjustments
override sub onCreateView()
    if m.isRtl()
        m.alignContent("right")
    else
        m.alignContent("left")
    end if
end sub

' Use in template field functions
{
    nodeType: "Label",
    fields: {
        horizAlign: function() as string
            return m.isRtl() ? "right" : "left"
        end function
    }
}
```

**Important**: These methods dynamically query the i18nService, so they always reflect the current locale state. They are available on all widgets regardless of whether an `i18n` configuration is specified.

## Common Patterns

### Menu System

```brightscript
class Menu extends Rotor.ViewModel

    override function template() as object
        menuItems = ["home", "settings", "about"]

        children = []
        for each itemKey in menuItems
            children.push({
                viewModel: ViewModels.MenuItem,
                props: {
                    itemKey: itemKey
                }
            })
        end for

        return {
            nodeType: "Group",
            i18n: {
                path: "navigation"
            },
            children: children
        }
    end function
end class

class MenuItem extends Rotor.ViewModel

    override function template() as object
        return {
            nodeType: "Label",
            fields: {
                text: `@l10n.${m.props.itemKey}`
            }
        }
    end function
end class
```

### Button Labels

```brightscript
class ActionButtons extends Rotor.ViewModel

    override function template() as object
        return {
            nodeType: "Group",
            i18n: {
                path: "buttons"
            },
            children: [
                {
                    id: "saveButton",
                    viewModel: ViewModels.Button,
                    props: {
                        label: "@l10n.save"
                    }
                },
                {
                    id: "cancelButton",
                    viewModel: ViewModels.Button,
                    props: {
                        label: "@l10n.cancel"
                    }
                }
            ]
        }
    end function
end class
```

### Conditional Localization

```brightscript
{
    nodeType: "Label",
    i18n: {
        paths: ["messages", "buttons"]
    },
    fields: {
        text: function() as string
            if m.props.isLoading
                return m.viewModelState.l10n.messages.loading
            else if m.props.hasError
                return m.viewModelState.l10n.messages.error
            else
                return m.viewModelState.l10n.messages.welcome
            end if
        end function,
        ' Dynamic RTL-aware alignment
        horizAlign: function() as string
            return m.isRtl() ? "right" : "left"
        end function
    }
}
```

## Best Practices

### Organize Translations Hierarchically

```brightscript
' Good: Logical grouping
{
    "ui": {
        "forms": {
            "login": {
                "username": "Username",
                "password": "Password"
            }
        },
        "buttons": {
            "submit": "Submit",
            "reset": "Reset"
        }
    }
}

' Avoid: Flat structure
{
    "loginUsername": "Username",
    "loginPassword": "Password",
    "submitButton": "Submit"
}
```

### Use Dynamic Keys for Reusability

```brightscript
' Good: Reusable component
{
    viewModel: ViewModels.StatusMessage,
    props: {
        statusType: "success"  ' or "error", "warning"
    },
    fields: {
        text: `@l10n.status.${m.props.statusType}`
    }
}
```

## RTL (Right-to-Left) Support

The framework automatically detects RTL languages based on the locale. RTL languages include:
- Arabic (ar)
- Hebrew (he)
- Persian/Farsi (fa)
- Urdu (ur)

### Detecting RTL at the Service Level

```brightscript
' Set Arabic locale
i18nService.setLocale("ar_SA")

' RTL is automatically detected
isRTL = i18nService.getIsRtl()  ' Returns true

' Set English locale
i18nService.setLocale("en_US")
isRTL = i18nService.getIsRtl()  ' Returns false
```

### Accessing RTL Status in ViewModels

All widgets and ViewModels have a built-in `isRtl()` method that dynamically checks the current locale's RTL status:

```brightscript
class MyViewModel extends Rotor.ViewModel
    override sub onCreateView()
        ' Check RTL status dynamically
        if m.isRtl()
            ' Apply RTL-specific layout adjustments
        else
            ' Apply LTR layout
        end if
    end sub

    override function template() as object
        return {
            nodeType: "Group",
            children: [
                {
                    nodeType: "Label",
                    fields: {
                        ' Dynamic RTL-aware alignment
                        horizAlign: function() as string
                            return m.isRtl() ? "right" : "left"
                        end function,
                        text: "@l10n.welcome"
                    }
                }
            ]
        }
    end function
end class
```

### RTL-Aware Layout Example

```brightscript
override function template() as object
    ' Calculate layout based on RTL
    startX = m.isRtl() ? 1920 : 0  ' Start from right for RTL
    direction = m.isRtl() ? -1 : 1  ' Negative offset for RTL

    return {
        nodeType: "Group",
        children: [
            {
                nodeType: "Rectangle",
                fields: {
                    translation: [startX + (100 * direction), 100]
                }
            }
        ]
    }
end function
```

**Note**: While RTL detection is implemented, full RTL layout mirroring (UI element positioning) requires additional implementation at the application level using the `isRtl()` method.

## Limitations

### Runtime Locale Switching

Changing locale at runtime is not fully implemented. Set the locale during application initialization.

### Advanced Formatting

The following features are not yet available:
- Currency formatting
- Date/time formatting
- Number formatting with locale-specific separators
- Plural forms handling

## Troubleshooting

### Missing Translation

Debug translation paths:

```brightscript
sub debugTranslation(keyPath as string)
    i18nService = m.framework.i18nService
    fullL10n = i18nService.getL10n()

    print "Translation keys:"
    for each key in fullL10n
        print "  " + key
    end for

    result = i18nService.getL10n(keyPath)
    print "Path '" + keyPath + "': " + FormatJson(result)
end sub
```

### Variable Interpolation Not Working

Check:
- `@l10n` reference is in template string: `` `@l10n.key` ``
- Key path exists in translation file
- ViewModel has `i18n` configuration with correct path
- Translation section is loaded (check `viewModelState.l10n`)

### Performance Issues

- Load only required translation sections using specific paths
- Cache translations in ViewModel state
- Avoid complex nested key resolution in frequently called functions


---

## 📚 Learn More

**NEXT STEP: [Cross-Thread MVI design pattern](./cross-thread-mvi.md)**

**Reference Documentation:**
- [Framework Initialization](./framework-initialization.md) - Configuration, task synchronization, and lifecycle
- [ViewBuilder Overview](./view-builder-overview.md) - High-level architecture and concepts
- [Widget Reference](./view-builder-widget-reference.md) - Complete Widget properties, methods, and usage patterns
- [ViewModel Reference](./view-builder-viewmodel-reference.md) - Complete ViewModel structure, lifecycle, and state management

**Plugin Documentation:**
- [Fields Plugin](./view-builder-fields-plugin.md) - Field management with expressions and interpolation
- [FontStyle Plugin](./view-builder-fontstyle-plugin.md) - Typography and font styling
- [Observer Plugin](./view-builder-observer-plugin.md) - Field observation patterns
- [Focus Plugin](./view-builder-focus-plugin.md) - Focus management and navigation

**Additional Documentation:**
- [Cross-Thread MVI design pattern](./cross-thread-mvi.md) - State management across threads
