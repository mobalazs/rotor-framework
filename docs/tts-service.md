# TTS Service (Text-to-Speech)

The TTS Service provides text-to-speech functionality for Rotor Framework applications using the native Roku `roAudioGuide` API.

## Overview

The TTS Service is a framework-level service (similar to `i18nService`) that enables widgets to speak text through a simple decorator pattern. It supports advanced features like flush control, character-by-character spelling, duplicate speech prevention, sentence secure (rapid navigation protection), and localized symbol pronunciation.

## Architecture

The TTS implementation consists of two layers:

1. **TtsService** - Framework service that wraps native `roAudioGuide` API
2. **widget.tts()** - Widget decorator for direct TTS access

## Basic Usage

### Simple Speech

```brightscript
' Speak text from any widget
widget.tts({
    say: "Hello world"
})
```

### Flush Control (Interrupt Current Speech)

```brightscript
' Interrupt current speech and speak new text
widget.tts({
    say: "Important message",
    flush: true
})
```

### Spell Out Mode (Character-by-Character)

```brightscript
' Spell out text for passwords, codes, etc.
widget.tts({
    say: "A1B2C3",
    spellOut: true
})
' Speaks: "A 1 B 2 C 3"
```

### Email Address Handling

```brightscript
' Spell out mode automatically handles emails
widget.tts({
    say: "user@domain.com",
    spellOut: true
})
' Speaks: "user at domain dot com"
```

### Decimal Number Handling

```brightscript
' Spell out mode handles decimals
widget.tts({
    say: "3.14",
    spellOut: true
})
' Speaks: "3 point 14"
```

### Prevent Duplicate Speech

```brightscript
' Don't speak if same text was just spoken
widget.tts({
    say: "Loading...",
    dontRepeat: true
})
```

### Override Next Flush (First Sentence Protection)

Protects the **first sentence** of multi-sentence text from being interrupted by the next flush request:

```brightscript
' Multi-sentence text with first sentence protection
widget.tts({
    say: "Please listen carefully. This is important. Don't skip this.",
    overrideNextFlush: true
})
' Speaks: "Please listen carefully" (PROTECTED),
'         "This is important" (not protected),
'         "Don't skip this" (not protected)

' Next flush will be blocked for first sentence only
widget.tts({
    say: "Interrupted",
    flush: true
})
' Result:
' - First sentence "Please listen carefully" completes (protection blocked flush)
' - Second and third sentences are interrupted
' - "Interrupted" speaks after first sentence completes
```

**Note:** Text is automatically split by periods (`.`). Only the first sentence receives protection. Single-sentence text (no periods) protects the entire text.

### Sentence Secure (Rapid Navigation Protection)

The TTS service automatically prevents speech pile-up during rapid navigation (e.g., fast menu scrolling) using a **200ms debounce timer**:

```brightscript
' User rapidly navigates through menu items
widget.tts({ say: "Menu item 1" })  ' Pending (200ms delay)
widget.tts({ say: "Menu item 2" })  ' Replaces item 1
widget.tts({ say: "Menu item 3" })  ' Replaces item 2
widget.tts({ say: "Menu item 4" })  ' Replaces item 3
' After 200ms of no new calls: "Menu item 4" is spoken (the last one)

' With flush, speaks immediately and cancels pending
widget.tts({ say: "Important!", flush: true })  ' Speaks immediately
```

**How it works:**
- Each non-flush TTS call stores speech as "pending" and resets a 200ms timer
- If another call comes within 200ms, it replaces the pending speech
- After 200ms of inactivity, the last pending speech is spoken
- `flush: true` bypasses debounce and speaks immediately, canceling any pending speech
- Uses SceneGraph Timer node for automatic execution

## API Reference

### widget.tts(config)

Speaks text through the TTS service.

**Parameters:**

- `config` (object) - TTS configuration object
  - `say` (string) - Text to speak (required)
  - `flush` (boolean) - Interrupt current speech (default: false)
  - `spellOut` (boolean) - Spell out character-by-character (default: false)
  - `overrideNextFlush` (boolean) - Protect from next flush (default: false)
  - `dontRepeat` (boolean) - Skip if same as last speech (default: false)

**Example:**

```brightscript
widget.tts({
    say: "Menu opened",
    flush: true,
    dontRepeat: true
})
```

## Framework Service API

The TTS service is accessible at `framework.ttsService` for advanced use cases.

### Methods

#### speak(config)

Main TTS function (same as widget.tts()).

```brightscript
framework.ttsService.speak({
    say: "Hello",
    flush: true
})
```

#### silence()

Immediately stops all speech.

```brightscript
framework.ttsService.silence()
```

#### enable() / disable()

Enable or disable the TTS service. When enabled, native AudioGuide on root node is disabled. When disabled, native AudioGuide is re-enabled.

**Note:** TTS can only be enabled if device AudioGuide is enabled in system settings.

```brightscript
framework.ttsService.disable()  ' Mute all TTS, enable native AudioGuide
framework.ttsService.enable()   ' Resume TTS, disable native AudioGuide
```

#### toggleAudioGuide([enableState])

Toggles TTS service on/off or sets explicit state. Returns new state.

**Parameters:**
- `enableState` (dynamic, optional) - `true` = enable, `false` = disable, omit/`invalid` = toggle

**Usage:**

```brightscript
' Toggle mode - switch current state
isEnabled = framework.ttsService.toggleAudioGuide()

' Explicit enable
framework.ttsService.toggleAudioGuide(true)

' Explicit disable
framework.ttsService.toggleAudioGuide(false)
```

**Example:**

```brightscript
' Toggle on button press
function onOptionsPressed()
    isEnabled = m.framework.ttsService.toggleAudioGuide()
    if isEnabled
        print "TTS is now enabled"
    else
        print "TTS is now disabled, native AudioGuide enabled"
    end if
end function
```

#### setSymbolDictionary(dictionary)

Update symbol pronunciation for localization.

```brightscript
' Hungarian localization
framework.ttsService.setSymbolDictionary({
    "@": "kukac",
    ".": "pont",
    "-": "kötőjel"
})
```

## Spell Out Mode Details

The `spellOut` mode intelligently processes different text patterns:

### Symbol Replacement

Symbols are replaced with spoken words using a localized dictionary:

```brightscript
widget.tts({
    say: "@#$",
    spellOut: true
})
' Speaks: "at hash dollar"
```

**Default Symbol Dictionary:**

- `@` → "at"
- `.` → "dot"
- `-` → "dash"
- `_` → "underscore"
- `#` → "hash"
- `$` → "dollar"
- `%` → "percent"
- `&` → "and"
- `*` → "star"
- `+` → "plus"
- `=` → "equals"
- `/` → "slash"
- `\` → "backslash"
- `|` → "pipe"
- `~` → "tilde"
- `^` → "caret"
- `<` → "less than"
- `>` → "greater than"
- `(` → "open paren"
- `)` → "close paren"
- `[` → "open bracket"
- `]` → "close bracket"
- `{` → "open brace"
- `}` → "close brace"
- `,` → "comma"
- `:` → "colon"
- `;` → "semicolon"

### Email Detection

Emails are automatically detected and processed:

```brightscript
widget.tts({
    say: "support@company.com",
    spellOut: true
})
' Speaks: "support at company dot com"
```

### Decimal Number Detection

Decimal numbers use "point" instead of "dot":

```brightscript
widget.tts({
    say: "3.14159",
    spellOut: true
})
' Speaks: "3 point 14159"
```

### Regular Text

Regular text is spelled character-by-character with spaces:

```brightscript
widget.tts({
    say: "ABC",
    spellOut: true
})
' Speaks: "A B C"
```

## Localization

### Customizing Symbol Pronunciation

Update the symbol dictionary for different languages:

```brightscript
' Spanish localization
framework.ttsService.setSymbolDictionary({
    "@": "arroba",
    ".": "punto",
    "-": "guión",
    "#": "numeral"
})
```

### Complete Dictionary Replacement

```brightscript
' Replace entire dictionary
framework.ttsService.setSymbolDictionary({
    "@": "at sign",
    ".": "period"
    ' ... add only symbols you need
})
```

## Use Cases

### Accessible Navigation

```brightscript
function onFocusChanged(hasFocus as boolean)
    if hasFocus
        m.tts({
            say: m.title,
            flush: true
        })
    end if
end function
```

### Form Field Validation

```brightscript
function validateEmail(email as string)
    if not isValidEmail(email)
        m.tts({
            say: "Invalid email address",
            flush: true
        })
    end if
end function
```

### Password Entry

```brightscript
function onPasswordCharEntered(char as string)
    m.tts({
        say: char,
        spellOut: true,
        flush: true
        dontRepeat: false  ' Allow same character twice
    })
end function
```

### Loading States

```brightscript
function showLoading()
    m.tts({
        say: "Loading content",
        dontRepeat: true,
        overrideNextFlush: true  ' Let it finish
    })
end function
```

### Menu Navigation

```brightscript
function onMenuItemFocused(item as object)
    m.tts({
        say: item.title + ", " + item.description,
        flush: true,
        dontRepeat: true
    })
end function
```

## Device AudioGuide Integration

The TTS service integrates with Roku's native AudioGuide system:

### Automatic Detection

The service automatically detects if AudioGuide is enabled in device system settings (`roDeviceInfo.isAudioGuideEnabled()`).

```brightscript
' TTS service only works if device AudioGuide is enabled
if framework.ttsService.isDeviceAudioGuideEnabled
    print "Device AudioGuide is enabled"
else
    print "User must enable AudioGuide in system settings"
end if
```

### Native AudioGuide Control

When TTS service is enabled, it automatically mutes the native AudioGuide on the root node to prevent conflicts:

```brightscript
' When TTS is enabled:
rootNode.muteAudioGuide = true  ' Native AudioGuide muted

' When TTS is disabled:
rootNode.muteAudioGuide = false  ' Native AudioGuide unmuted
```

The `muteAudioGuide` property is **inherited** by all child nodes, ensuring the entire application uses only one TTS system at a time.

### Initialization Behavior

During framework initialization:

1. Check if `roDeviceInfo.isAudioGuideEnabled()` returns true
2. If false, TTS service disables itself
3. If true and TTS enabled, mute native AudioGuide on root node (`muteAudioGuide = true`)
4. On destroy, unmute native AudioGuide (`muteAudioGuide = false`)

## Best Practices

1. **Check device AudioGuide first** - TTS only works if user enabled AudioGuide in system settings
2. **Use `flush: true` for important messages** - Ensures user hears critical information
3. **Use `dontRepeat: true` for repetitive actions** - Prevents annoying duplicate speech
4. **Use `overrideNextFlush` sparingly** - Only for critical first sentences
5. **Trust sentence secure for navigation** - No need for `flush` on every focus change; service automatically skips during rapid navigation
6. **Use `spellOut` for:**
   - Passwords and security codes
   - Email addresses
   - File names with special characters
   - Abbreviations and acronyms
7. **Localize symbol dictionary** - Provide native language symbol names
8. **Keep messages concise** - Long messages can be interrupted or ignored
9. **Provide context** - "Menu opened" vs just "Opened"
10. **Respect user's AudioGuide setting** - Don't try to override device-level disable

## Performance Considerations

- TTS service is lightweight and available on all widgets
- No event system overhead (direct service access)
- Native `roAudioGuide` API is optimized by Roku
- `dontRepeat` flag reduces unnecessary TTS calls
- Sentence secure prevents speech queue pile-up during rapid navigation
- Debounce timer runs in background (200ms SceneGraph Timer node)
- Timer overhead is minimal (repeating timer checks every 200ms)
- Service automatically disables if device AudioGuide not enabled
- Service can be globally toggled with `toggleAudioGuide()`
- Native AudioGuide automatically managed (no manual control needed)

## Debugging

Enable debug mode to see TTS activity:

```brightscript
#if debug
    ? "[TTS_SERVICE] Speaking: Hello world (flush: true, spellOut: false)"
#end if
```

All TTS operations are logged in debug builds.

## Comparison with Beam TTS

Rotor's TTS implementation is simpler than Beam's 3-layer architecture:

| Feature | Beam TTS | Rotor TTS |
|---------|----------|-----------|
| Architecture | 3 layers (Node + Router + Events) | 2 layers (Service + Decorator) |
| Access | Event-based | Direct widget access |
| Component Processing | Yes | No (service-level only) |
| Symbol Handling | Yes | Yes |
| Flush Control | Yes | Yes |
| Override Protection | Yes | Yes |
| Decimal Handling | Yes | Yes |

Rotor's simpler architecture provides the same core functionality with less complexity.
