# Rotor Framework

[![Coverage Status](https://coveralls.io/repos/github/mobalazs/rotor-framework/badge.svg?branch=main&v=2)](https://coveralls.io/github/mobalazs/rotor-framework?branch=main)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/mobalazs/rotor-framework)](https://github.com/mobalazs/rotor-framework/packages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Slack](https://img.shields.io/badge/Slack-RokuDevelopers-4A154B?logo=slack)](https://rokudevelopers.slack.com)

**Rotor** is a modular, ViewModel-first UI framework for Roku applications built with BrighterScript and SceneGraph. It is lightweight and designed to intuitively speed up development time while simplifying both the implementation and long-term maintenance process. It features a rich ViewBuilder system and a Roku-friendly implementation of the MVI (Model-View-Intent) design pattern. It helps developers structure large-scale apps with reusable components, state-driven logic, and optimized rendering — all without relying on traditional XML-based views.

---

## 🚀 Key Features

* **ViewBuilder system**: Declarative and extensible view construction with a flexible, code-based template system, automatic full lifecycle management, and a virtual node tree abstraction.
* **Roku-friendly MVI design pattern**: Predictable state, clear separation of concerns, and cross-thread compatibility.
* **Component-based UI**: Isolated, reusable UI widgets and view models.
* **i18n support**: Locale-aware interface with flexible language resource injection.
* **Integrated Animate Library**: [https://github.com/haystacknews/animate](https://github.com/haystacknews/animate)

---

## 📦 Installation

Rotor is structured as a shared library for Brighterscript projects. To install:

1. Copy the `source/rotor` directory into your project.
2. Import Rotor in your main file:

```vb
import "pkg:/source/rotor/RotorFramework.bs"
```

---

## ⚡ Quick Start

```vb

frameworkInstance = new Rotor.Framework()

frameworkInstance.render([
    {
        id: "helloLabel", ' optional
        nodeType: "Label",
        fields: {
            text: "Hello World!",
            color: "#CCCCCC"
        }
    }
])

```

This minimalist example initializes the framework and displays a label on screen. This minimal setup fully initializes the ViewBuilder and demonstrates its core rendering capabilities. You can find many more examples and capabilities in the detailed documentation.

---

## 📚 Learn More

### MVI Documentation
* [Cross-Thread MVI design pattern](https://github.com/mobalazs/rotor-framework/blob/main/docs/cross-thread-mvi.md) - State management across threads

### ViewBuilder Reference
* [ViewBuilder Overview](https://github.com/mobalazs/rotor-framework/blob/main/docs/view-builder-overview.md) - High-level architecture and core concepts
* [Widget Reference](https://github.com/mobalazs/rotor-framework/blob/main/docs/view-builder-widget-reference.md) - Complete Widget properties, methods, and usage patterns
* [ViewModel Reference](https://github.com/mobalazs/rotor-framework/blob/main/docs/view-builder-viewmodel-reference.md) - Complete ViewModel structure, lifecycle, and state management

### ViewBuilder Plugins
* [ViewBuilder Fields Plugin](https://github.com/mobalazs/rotor-framework/blob/main/docs/view-builder-fields-plugin.md) - Field management and binding
* [ViewBuilder FontStyle Plugin](https://github.com/mobalazs/rotor-framework/blob/main/docs/view-builder-fontstyle-plugin.md) - Typography and styling
* [ViewBuilder Observer Plugin](https://github.com/mobalazs/rotor-framework/blob/main/docs/view-builder-observer-plugin.md) - State observation patterns
* [ViewBuilder Focus Plugin](https://github.com/mobalazs/rotor-framework/blob/main/docs/view-builder-focus-plugin.md) - Focus management system

### i18N Documentation
* [Internationalization support](https://github.com/mobalazs/rotor-framework/blob/main/docs/i18n-support.md) - Locale-aware interface implementation

---

## 🔧 Requirements

* Roku SceneGraph (firmware 10.5+ recommended)
* BrighterScript V1

---

## 📄 License

Rotor is MIT licensed. See `LICENSE` file for details.

---

© 2025 Rotor Molnar Balazs
