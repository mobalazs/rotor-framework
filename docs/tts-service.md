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

### Dynamic Speech (Function)

```brightscript
' Use a function that returns text
widget.tts({
    say: function() as string
        return "Current count: " + Str(m.viewModelState.count)
    end function
})
```

### String Interpolation

```brightscript
' Use @ to reference context.viewModelState properties
widget.tts().speak({
    say: "You selected @selectedItem.title",
    context: m
})

' Use $ to reference context properties (HID, id, etc.)
widget.tts().speak({
    say: "Widget $id has focus",
    context: m
})

' Multiple interpolations
widget.tts().speak({
    say: "Loading @loadingProgress percent in widget $id",
    context: m
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

### Speak Once Mode (onceKey)

Speak text only once per cache key. Useful for announcements that should only play once per session (e.g., welcome messages, tutorial hints).

```brightscript
' Speak only once - uses explicit cache key
widget.tts({
    say: "Welcome to the application!",
    onceKey: "welcome-message"
})
' Second call with same onceKey - skips (already spoken)
widget.tts({
    say: "Welcome to the application!",
    onceKey: "welcome-message"  ' SKIPPED
})

' Different text, same key - still skips (key-based caching)
widget.tts({
    say: "Bienvenue dans l'application!",  ' French version
    onceKey: "welcome-message"  ' SKIPPED (same key)
})
```

**Manual cache removal:**

```brightscript
' Remove specific key to allow re-speaking
m.framework.ttsService.removeOnceKey("welcome-message")

' Now speaks again
widget.tts({
    say: "Welcome to the application!",
    onceKey: "welcome-message"  ' SPEAKS (key removed)
})
```

**Use cases:**
- Welcome messages on first launch
- Tutorial hints that should only play once
- One-time announcements per session
- Localized announcements (same key, different language text)

### Override Next Flush (Multi-Part Speech Protection)

Bypasses the 300ms threshold for immediate execution AND protects **all subsequent speech** from being flushed until the pending speech executes. The protection works through two internal flags:
- `preventNextFlushFlag`: Set by caller, cleared after first use
- `isPendingProtected`: Inherits protection across multiple pending replacements

This is essential for multi-part announcements like menu titles:

```brightscript
' Menu title bypasses threshold and protects first sentence
widget.tts({
    say: "Page Menu, 5 items.",
    flush: true,
    preventNextFlush: true
})
' Speaks immediately (no threshold delay)
' First sentence "Page Menu, 5 items" is PROTECTED

' First menu item queues instead of interrupting
widget.tts({
    say: "Home, 1 of 5",
    flush: true
})
' Result:
' - "Page Menu, 5 items" completes (protection blocked flush)
' - "Home, 1 of 5" queues and speaks after menu title
```

**Multi-sentence example:**
```brightscript
widget.tts({
    say: "Please listen carefully. This is important. Don't skip this.",
    preventNextFlush: true
})
' Bypasses threshold, speaks immediately
' First sentence "Please listen carefully" is PROTECTED
' Second and third sentences are NOT protected

widget.tts({
    say: "Interrupted",
    flush: true
})
' This call arrives while still speaking
' Result:
' - First sentence "Please listen carefully" completes (protection blocks the flush)
' - Second sentence "This is important" becomes PENDING (goes into 300ms threshold)
' - Third sentence "Don't skip this" is never spoken (replaced)
' - "Interrupted" becomes pending, replaces second sentence
' - After protection ends and threshold expires: "Interrupted" speaks
```

**How protection inheritance works with threshold:**

The mechanism uses the `isPendingProtected` flag:

1. **Menu title** with `preventNextFlush: true`:
   - Bypasses threshold → speaks immediately
   - Sets `isPendingProtected = true` to block all future flushes

2. **First menu item** with `flush: true`:
   - `isPendingProtected` blocks the flush → item becomes PENDING (300ms threshold)
   - Flag remains true, continues blocking

3. **Rapid menu navigation**:
   - All items have flush blocked by `isPendingProtected`
   - Each item replaces pending speech within threshold
   - Last item speaks after 300ms of inactivity
   - When pending executes, `isPendingProtected` is cleared

**Example: Menu title + rapid navigation**
```brightscript
' Menu opens - title speaks immediately and is protected
widget.tts({ say: "Page Menu, 5 items.", preventNextFlush: true })
' Title speaks immediately, isPendingProtected = true

' User immediately navigates (rapid focus changes)
widget.tts({ say: "Home, 1 of 5", flush: true })       ' Flush blocked by isPendingProtected → PENDING
widget.tts({ say: "Settings, 2 of 5", flush: true })   ' Flush blocked by isPendingProtected → Replaces "Home"
widget.tts({ say: "About, 3 of 5", flush: true })      ' Flush blocked by isPendingProtected → Replaces "Settings"
' User stops at "About"
' After 300ms: "About, 3 of 5" speaks, isPendingProtected cleared
```

**Note:** Text is automatically split by periods (`.`). The first sentence of multi-sentence text is automatically protected via `preventNextFlush: true`. This sets `isPendingProtected = true`, which blocks ALL subsequent flush calls (both remaining sentences AND external calls like menu navigation) until the pending speech executes.

### Sentence Secure (Rapid Navigation Protection)

The TTS service automatically prevents speech pile-up during rapid navigation (e.g., fast menu scrolling) using a **300ms threshold timer**:

```brightscript
' User rapidly navigates through menu items
widget.tts({ say: "Menu item 1" })  ' Pending (300ms delay)
widget.tts({ say: "Menu item 2" })  ' Replaces item 1
widget.tts({ say: "Menu item 3" })  ' Replaces item 2
widget.tts({ say: "Menu item 4" })  ' Replaces item 3
' After 300ms of no new calls: "Menu item 4" is spoken (the last one)
```

**How it works:**
- ALL TTS calls (both flush=true and flush=false) store speech as "pending" and reset a 300ms timer
- If another call comes within 300ms, it replaces the pending speech
- After 300ms of inactivity, the last pending speech is spoken
- `preventNextFlush: true` bypasses threshold and speaks immediately, plus protects from next flush
- Uses SceneGraph Timer node for automatic execution

## API Reference

### widget.tts(config)

Speaks text through the TTS service.

**Parameters:**

- `config` (object) - TTS configuration object
  - `say` (string | function) - Text to speak or function returning text (required)
    - **String**: Plain text or interpolated text with `@viewModelState.key` or `$context.property` patterns
    - **Function**: Called with context scope if provided, must return string
  - `context` (object) - Context for string interpolation (optional, widget or any object with viewModelState)
  - `flush` (boolean) - Interrupt current speech (default: false)
  - `spellOut` (boolean) - Spell out character-by-character (default: false)
  - `preventNextFlush` (boolean) - Bypass threshold AND protect from next flush (default: false)
  - `dontRepeat` (boolean) - Skip if same as last speech (default: false)
  - `onceKey` (string) - Cache key for speak-once mode. If provided, speech is cached and skipped on subsequent calls with same key (optional)

**Examples:**

```brightscript
' Plain string (no context needed)
widget.tts().speak({
    say: "Menu opened",
    flush: true,
    dontRepeat: true
})

' String interpolation with context
widget.tts().speak({
    say: "Selected @currentItem.name",
    context: widget  ' or m in widget scope
})

' String interpolation - context properties
widget.tts().speak({
    say: "Focus on widget $id",
    context: m
})

' Function with context
widget.tts().speak({
    say: function() as string
        return "Score: " + Str(m.viewModelState.score)
    end function,
    context: m,
    flush: true
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

#### stopSpeech()

Immediately stops all speech and cancels pending speech.

```brightscript
framework.ttsService.stopSpeech()
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

#### removeOnceKey(key)

Removes a specific key from the speak-once cache, allowing text with that key to be spoken again.

**Parameters:**
- `key` (string) - The onceKey to remove from cache

```brightscript
' Remove specific key
framework.ttsService.removeOnceKey("welcome-message")

' Now this will speak again
widget.tts({ say: "Welcome!", onceKey: "welcome-message" })
```

#### clearOnceCache()

Clears the entire speak-once cache, allowing all previously cached speeches to be spoken again.

```brightscript
' Clear all cached keys (e.g., on app restart or user logout)
framework.ttsService.clearOnceCache()
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
        preventNextFlush: true  ' Let it finish
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
4. **Use `preventNextFlush` sparingly** - Only for critical first sentences
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
