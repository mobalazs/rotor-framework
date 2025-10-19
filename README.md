# Rotor Framework

**Rotor** is a modular, ViewModel-first UI framework for Roku applications built with BrighterScript and SceneGraph. It is lightweight and designed to intuitively speed up development time while simplifying both the implementation and long-term maintenance process. It features a rich ViewBuilder system and a Roku-friendly implementation of the MVI (Model-View-Intent) design pattern. It helps developers structure large-scale apps with reusable components, state-driven logic, and optimized rendering — all without relying on traditional XML-based views.

---

## 🚀 Key Features

* **ViewBuilder system**: Declarative and extensible view construction with a flexible, code-based template system, automatic full lifecycle management, and a virtual node tree abstraction.
* **Roku-friendly MVI design pattern**: Predictable state, clear separation of concerns, and multi-thread compatibility.
* **Component-based UI**: Isolated, reusable UI widgets and view models.
* **i18n support**: Locale-aware interface with flexible language resource injection.
* **Integrated Animate Library**: [https://github.com/haystacknews/animate](https://github.com/haystacknews/animate)

---

## 📦 Installation

Rotor is structured as a shared library for Brighterscript projects. To install:

1. Copy the `source/libs/rotorFramework` directory into your project.
2. Import Rotor in your main file:

```vb
import "pkg:/source/libs/rotorFramework/RotorFramework.bs"
```

---

## ⚡ Quick Start

```vb
sub initApplication()

    frameworkInstance = new Rotor.Framework()

    frameworkInstance.render([
        {
            nodeType: "Rectangle",
            fields: {
                width: UI.testRectangle.width,
                height: UI.testRectangle.height,
                translation: [UI.safeAreaOffsets.x, UI.safeAreaOffsets.y],
                color: UI.testRectangle.color
            }
        }
    ])

end sub
```

This minimalist example initializes the framework and displays a green rectangle on screen. This minimal setup fully initializes the ViewBuilder and demonstrates its core rendering capabilities. You can find many more examples and capabilities in the detailed documentation.

### 🧩 Build tool for generating UI constants and enums

```js
// theme.js
export const UI = {
  safeAreaOffsets: {
    x: 90,
    y: 60,
  },
  testRectangle: {
    width: 150,
    height: 100,
    color: "0x3E6641FF"
  }
}
```

<details>
<summary>BrightScript version</summary>

```vb
namespace UI

    enum safeAreaOffsets
        x = 90
        y = 60
    end enum

    enum testRectangle
        width = 150
        height = 100
        color = "0x3E6641FF"
    end enum

end namespace
```

</details>
<br>
The Rotor framework boilerplate and POC also include a build system feature that processes a `theme.js` file. This file allows you to define complex UI design in JavaScript, and automatically converts them into a BrighterScript-compatible file during the build. This makes it easy to manage large design systems in a clean, maintainable way.

---

## 📚 Learn More

### Core Documentation
* [ViewBuilder Guide](docs/view-builder.md) - Complete guide to the declarative UI system
* [Multi-Thread MVI design pattern](docs/multi-thread-mvi.md) - State management across threads

### ViewBuilder Deep Dives
* [ViewBuilder Core How-to](docs/view-builder-core-howto.md) - Core concepts and usage patterns
* [ViewBuilder Fields How-to](docs/view-builder-fields-howto.md) - Field management and binding
* [ViewBuilder Focus How-to](docs/view-builder-focus-howto.md) - Focus management system
* [ViewBuilder Observer How-to](docs/view-builder-observer-howto.md) - State observation patterns
* [ViewBuilder FontStyle How-to](docs/view-builder-fontstyle-howto.md) - Typography and styling

### i18N Documentation
* [Internationalization support](i18n-support.md) - Locale-aware interface implementation

---

## 🔧 Requirements

* Roku SceneGraph (firmware 10.5+ recommended)
* BrighterScript 0.69.0 (Future improvement: Migrate to BrighterScript V1)
* Node.js + Rooibos (optional: for unit testing)

---

## 📄 License

Rotor is MIT licensed. See `LICENSE` file for details.

---

© 2025 Rotor Molnar Balazs
