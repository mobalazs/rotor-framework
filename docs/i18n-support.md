# Rotor Framework Internationalization (i18n) Support - Complete Guide

← [Back to Documentation](../README.md#-learn-more)

## Overview

The Rotor Framework provides built-in internationalization (i18n) support through the `I18nService` class. This system enables multi-language applications with automatic locale management, translation loading, and easy text localization throughout the application. The i18n system integrates seamlessly with ViewModels and supports variable interpolation in translations.

## Key Features

- **Multi-Language Support**: Manage multiple locales and translations
- **Automatic Integration**: ViewModels automatically receive localized content
- **Variable Interpolation**: Dynamic text with `@l10n` variable references
- **Caching System**: Efficient translation caching for performance
- **Template String Support**: Dynamic key paths for flexible translations
- **Locale Detection**: Automatic locale detection (currently defaults to en_US)
- **Easy Asset Management**: JavaScript-to-BrightScript translation compilation

## Current Limitations

- **RTL Support**: Right-to-left (RTL) languages are not currently supported
- **Dynamic Locale Switching**: Runtime locale changes are not fully implemented
- **Advanced Formatting**: Currency, date, and number formatting features are planned but not yet available

## Translation Setup

### 1. JavaScript Translation Files

Define translations in JavaScript for easy management:

```javascript
// File: assetsJs/translation.js
module.exports = function () {
    let appTitle = 'Rotor Framework POC';
    
    let en_US = {
        appTitle: appTitle,
        helloWorld: 'Hello World!',
        menuItems: {
            home: {
                text: 'Home'
            },
            movies: {
                text: 'Movies'
            },
            series: {
                text: 'Series'
            },
            settings: {
                text: 'Settings'
            },
            exitApp: {
                text: 'Exit POC'
            }
        },
        loadingScreen: {
            almostDone: "Almost done...",
            loading: "LOADING"
        },
        settings: {
            languagePicker: {
                headlineText: 'Languages:'
            }
        },
        dialog: {
            cancelButton: 'Cancel',
            okButton: 'OK',
            exitAppTitle: 'Exit App',
            confirmExitAppMessage: 'Are you sure you want to exit POC App?',
            exitAppButton: 'Exit'
        },
        promoButtonTexts: {
            limitedTimeOffer: 'Limited-Time Offers!',
            learnMore: 'Learn more'
        }
    };
    
    // Add more languages as needed
    let es_ES = {
        appTitle: appTitle,
        helloWorld: '�Hola Mundo!',
        menuItems: {
            home: { text: 'Inicio' },
            movies: { text: 'Pel�culas' },
            series: { text: 'Series' },
            settings: { text: 'Configuraci�n' },
            exitApp: { text: 'Salir POC' }
        }
        // ... more translations
    };
    
    return {
        en_US: en_US,
        es_ES: es_ES
    };
};
```

### 2. Compiled BrightScript Translations

The JavaScript translations are automatically compiled to BrightScript:

```brightscript
// File: src/assets/generated/aaTranslation.brs (auto-generated)
function get_aaTranslation() as Object
    return {
        "en_US": {
            "appTitle": "Rotor Framework POC",
            "helloWorld": "Hello World!",
            "menuItems": {
                "home": {
                    "text": "Home"
                },
                "movies": {
                    "text": "Movies"
                }
                // ... etc
            }
        }
    }
end function
```

## ViewModel i18n Integration

### 1. Basic i18n Configuration

ViewModels automatically receive i18n support through configuration:

```brightscript
// Basic ViewModel with i18n
{
    id: "localizedWidget",
    viewModel: ViewModels.LocalizedWidget,
    i18n: {
        path: "menuItems"  // Load menuItems section
    }
}
```

### 2. Advanced i18n Configuration

```brightscript
// Advanced i18n configuration
{
    id: "advancedLocalizedWidget", 
    viewModel: ViewModels.AdvancedWidget,
    i18n: {
        paths: ["menuItems", "dialog", "settings"],  // Multiple sections
        includeIsRtl: true,     // Include RTL flag (currently always false)
        includeLocale: true     // Include current locale string
    }
}
```

### 3. Accessing i18n Data in ViewModels

```brightscript
// File: src/components/app/renderThread/viewModels/myLocalizedWidget.bs
namespace ViewModels
    class MyLocalizedWidget extends ViewModel
        
        override sub onCreateView()
            ' Access localization data
            appTitle = m.viewModelState.l10n.appTitle
            homeText = m.viewModelState.l10n.menuItems.home.text
            
            ' Access RTL and locale (if enabled)
            if m.viewModelState.isRTL <> invalid
                isRightToLeft = m.viewModelState.isRTL  ' Currently always false
            end if
            
            if m.viewModelState.locale <> invalid
                currentLocale = m.viewModelState.locale  ' e.g., "en_US"
            end if
        end sub
        
        override function template() as object
            return {
                nodeType: "Group",
                children: [
                    {
                        id: "titleLabel",
                        nodeType: "Label",
                        fields: {
                            text: m.viewModelState.l10n.appTitle,
                            color: "#FFFFFF"
                        }
                    }
                ]
            }
        end function
    end class
end namespace
```

## Variable Interpolation

### 1. Using @l10n References

The most powerful feature is using `@l10n` variable references in field values:

```brightscript
// File: src/components/app/renderThread/viewModels/layout/pageMenu/pageMenuItem.bs
{
    id: "menuItemLabel",
    nodeType: "Label",
    fontStyle: UI.components.pageMenu.fontStyle_aa,
    fields: {
        // Direct reference to localized text
        text: `@l10n.menuItems.${m.props.optionKey}.text`,
        color: function() as string
            if m.viewModelState.isFocused
                return UI.components.pageMenu.textColor.focused
            else
                return UI.components.pageMenu.textColor.default
            end if
        end function
    }
}
```

### 2. Dynamic Key Path Resolution

```brightscript
// Dynamic key paths with props
{
    nodeType: "Label", 
    fields: {
        text: `@l10n.menuItems.${m.props.pageKey}.text`  // Uses props.pageKey
    }
}

// Examples of resolved paths:
// If props.pageKey = "home" � resolves to l10n.menuItems.home.text
// If props.pageKey = "movies" � resolves to l10n.menuItems.movies.text
```

### 3. Complex Variable Interpolation

```brightscript
// Multiple variable references in one string
{
    nodeType: "Label",
    fields: {
        text: `@l10n.dialog.${m.props.dialogType}Title - @l10n.appTitle`
    }
}

// Conditional localization
{
    nodeType: "Label", 
    fields: {
        text: function() as string
            if m.props.showFullTitle
                return m.viewModelState.l10n.dialog.exitAppTitle
            else
                return m.viewModelState.l10n.dialog.okButton
            end if
        end function
    }
}
```

## Common Usage Patterns

### 1. Menu System Localization

```brightscript
// File: src/components/app/renderThread/viewModels/layout/pageMenu/pageMenu.bs
namespace ViewModels
    class PageMenu extends ViewModel
        
        override function template() as object
            return {
                nodeType: "Group",
                i18n: {
                    path: "menuItems"  // Load menu translations
                },
                children: [
                    {
                        id: "homeMenuItem",
                        viewModel: ViewModels.PageMenuItem,
                        props: {
                            optionKey: "home"  // Used in @l10n reference
                        }
                    },
                    {
                        id: "moviesMenuItem", 
                        viewModel: ViewModels.PageMenuItem,
                        props: {
                            optionKey: "movies"
                        }
                    }
                ]
            }
        end function
    end class
end namespace
```

### 2. Dialog Localization

```brightscript
// Localized dialog system
{
    id: "exitDialog",
    viewModel: ViewModels.Dialog,
    i18n: {
        path: "dialog"
    },
    props: {
        dialogType: "exitApp"
    },
    children: [
        {
            id: "dialogTitle",
            nodeType: "Label",
            fields: {
                text: "@l10n.exitAppTitle",
                fontStyle: UI.fontStyles.H2_aa
            }
        },
        {
            id: "dialogMessage",
            nodeType: "Label", 
            fields: {
                text: "@l10n.confirmExitAppMessage"
            }
        },
        {
            id: "cancelButton",
            viewModel: ViewModels.Button,
            props: {
                text: "@l10n.cancelButton"
            }
        },
        {
            id: "exitButton",
            viewModel: ViewModels.Button,
            props: {
                text: "@l10n.exitAppButton"
            }
        }
    ]
}
```

### 3. Loading Screen Localization

```brightscript
// Loading screen with dynamic text
{
    id: "loadingScreen",
    viewModel: ViewModels.LoadingScreen,
    i18n: {
        path: "loadingScreen"
    },
    children: [
        {
            id: "loadingLabel",
            nodeType: "Label",
            fields: {
                text: function() as string
                    if m.props.isAlmostDone
                        return m.viewModelState.l10n.almostDone
                    else
                        return m.viewModelState.l10n.loading
                    end if
                end function
            }
        }
    ]
}
```

## I18n Service API

### Core Methods

```brightscript
// Framework automatically provides I18nService instance
i18nService = m.getFrameworkInstance().i18nService

// Get current locale
currentLocale = i18nService.getLocale()  // Returns "en_US"

// Get RTL status (currently always false)
isRTL = i18nService.getIsRtl()  // Returns false

// Get full l10n object
allTranslations = i18nService.getL10n()

// Get specific translation section
menuTranslations = i18nService.getL10n("menuItems")

// Get multiple sections merged
multipleSection = i18nService.getL10n(["menuItems", "dialog"])
```

### Service Configuration

```brightscript
// Service initialization (handled by framework)
i18nService = new Rotor.ViewBuilder.I18nService()
i18nService.init(frameworkInstance)

// Set translations (done automatically during app startup)
translations = get_aaTranslation()
i18nService.setL10n(translations[currentLocale])

// Extend existing translations
additionalTranslations = {
    newSection: {
        newKey: "New Value"
    }
}
i18nService.extendL10n(additionalTranslations)
```

## Asset Compilation Process

### 1. Development Workflow

```bash
# 1. Edit translations in JavaScript
# Edit: assetsJs/translation.js

# 2. Run precompiler to generate BrightScript
npm run precompiler

# 3. Generated file appears at:
# src/assets/generated/aaTranslation.brs
```

### 2. Build Integration

The translation compilation is automatically integrated into the build process:

```json
// package.json scripts
{
    "precompiler": "node scripts/precompiler.js",
    "build-dev": "npm run precompiler && bsc --project bsconfig-dev.json",
    "build-tests": "npm run precompiler && bsc --project bsconfig-tests.json"
}
```

## Best Practices

### 1. Translation Key Organization

```javascript
// Good: Hierarchical organization
let translations = {
    ui: {
        buttons: {
            save: "Save",
            cancel: "Cancel"
        },
        labels: {
            username: "Username",
            password: "Password"
        }
    },
    messages: {
        errors: {
            networkError: "Network connection failed",
            validationError: "Please check your input"
        },
        success: {
            dataSaved: "Data saved successfully"
        }
    }
};

// Avoid: Flat structure
let badTranslations = {
    saveButton: "Save",
    cancelButton: "Cancel", 
    usernameLabel: "Username",
    networkErrorMessage: "Network connection failed"
};
```

### 2. Dynamic Key Usage

```brightscript
// Good: Use props for dynamic keys
{
    fields: {
        text: `@l10n.buttons.${m.props.buttonType}`  // Flexible
    }
}

// Good: Consistent naming patterns
{
    fields: {
        text: `@l10n.menuItems.${m.props.optionKey}.text`
    }
}
```

### 3. Fallback Strategies

```brightscript
// Provide fallbacks for missing translations
{
    fields: {
        text: function() as string
            translatedText = m.viewModelState.l10n?.menuItems?[m.props.optionKey]?.text
            if translatedText <> invalid
                return translatedText
            else
                return m.props.fallbackText ?? "Missing Translation"
            end if
        end function
    }
}
```

## Current Limitations and Future Plans

### Limitations

1. **RTL Support**: Right-to-left languages are not supported
   ```brightscript
   // Currently always returns false
   isRTL = i18nService.getIsRtl()  // Always false
   ```

2. **Runtime Locale Switching**: Cannot change locale after app startup
3. **Advanced Formatting**: No built-in support for:
   - Currency formatting
   - Date/time formatting
   - Number formatting with locale-specific separators
   - Plural forms handling

### Planned Features

```brightscript
// Future API improvements (not yet implemented)
i18nService.getDecimalSeparator()      // "." or ","
i18nService.getThousandSeparator()     // "," or "."
i18nService.getCurrencyCode()          // "USD", "EUR", etc.
i18nService.getPluralCategory(count)   // "one", "few", "many"
i18nService.formatCurrency(amount)     // "$1,234.56"
i18nService.formatDate(date, format)   // Localized date formatting
```

## Troubleshooting

### Common Issues

#### Translation Not Found
```brightscript
// Debug missing translations
sub debugTranslation(keyPath as string)
    i18nService = m.getFrameworkInstance().i18nService
    fullL10n = i18nService.getL10n()
    
    print "Available keys at root:"
    for each key in fullL10n
        print "  " + key
    end for
    
    print "Looking for: " + keyPath
    result = i18nService.getL10n(keyPath)
    print "Result: " + FormatJson(result)
end sub
```

#### Variable Interpolation Issues
- Ensure `@l10n` references are in template strings: `\`@l10n.key\``
- Check that the key path exists in your translations
- Verify the ViewModel has i18n configuration

#### Performance Issues
- Use specific key paths instead of loading entire translation object
- Cache frequently accessed translations in ViewModel state
- Avoid complex nested key resolution in frequently called functions

The Rotor Framework's i18n system provides a solid foundation for building multi-language applications. While RTL support and advanced formatting features are planned for future releases, the current system effectively handles most common localization needs with a clean, developer-friendly API.
