# Rotor Framework

<div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:0.5rem;">
  <span style="display:flex; flex-wrap:wrap; gap:0.5rem;">
    <a href="https://coveralls.io/github/mobalazs/rotor-framework?branch=main"><img src="https://coveralls.io/repos/github/mobalazs/rotor-framework/badge.svg?branch=main&v=2" alt="Coverage Status" /></a>
    <a href="https://github.com/mobalazs/rotor-framework/packages"><img src="https://img.shields.io/github/package-json/v/mobalazs/rotor-framework" alt="GitHub package.json version" /></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
    <a href="https://rokudevelopers.slack.com"><img src="https://img.shields.io/badge/Slack-RokuDevelopers-4A154B?logo=slack" alt="Slack" /></a>
  </span>
  <span><a href="./docs/ai/readme.opt.yaml">🌱</a></span>
</div>

<br/>

**Rotor** is a modular, ViewModel-first UI framework for Roku applications built with BrighterScript and SceneGraph. It is lightweight and designed to intuitively speed up development time while simplifying both the implementation and long-term maintenance process. It features a rich ViewBuilder system and a Roku-friendly implementation of the MVI (Model-View-Intent) design pattern. It helps developers structure large-scale apps with reusable components, state-driven logic, and optimized rendering — all without relying on traditional XML-based views.

---

## 🚀 Key Features

-   **ViewBuilder system**: Declarative and extensible view construction with a flexible, code-based template system, automatic full lifecycle management, and a virtual node tree abstraction.
-   **Roku-friendly MVI design pattern**: Predictable state, clear separation of concerns, and cross-thread compatibility.
-   **Component-based UI**: Isolated, reusable UI widgets and view models.
-   **i18n support**: Locale-aware interface with flexible language resource injection.
-   **Integrated** [Animate](https://github.com/haystacknews/animate) Library 


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

---

## Token-efficient documentation for AI

You can find 🌱 symbols in the top right corner of all documentation pages. These symbols link to AI-optimized summaries of the respective documentation.

**📖 [Read more about token savings](./docs/token-efficient-docs.md)**


---

## 📚 Learn More

### MVI Documentation

-   [Cross-Thread MVI design pattern](./docs/cross-thread-mvi.md) - State management across threads

### ViewBuilder Reference

-   [ViewBuilder Overview](./docs/view-builder-overview.md) - High-level architecture and core concepts
-   [Widget Reference](./docs/view-builder-widget-reference.md) - Complete Widget properties, methods, and usage patterns
-   [ViewModel Reference](./docs/view-builder-viewmodel-reference.md) - Complete ViewModel structure, lifecycle, and state management

### ViewBuilder Plugins

-   [ViewBuilder Fields Plugin](./docs/view-builder-fields-plugin.md) - Field management and binding
-   [ViewBuilder FontStyle Plugin](./docs/view-builder-fontstyle-plugin.md) - Typography and styling
-   [ViewBuilder Observer Plugin](./docs/view-builder-observer-plugin.md) - State observation patterns
-   [ViewBuilder Focus Plugin](./docs/view-builder-focus-plugin.md) - Focus management system

### i18N Documentation

-   [Internationalization support](./docs/i18n-support.md) - Locale-aware interface implementation

---

## 🔧 Requirements

-   Roku SceneGraph (firmware 10.5+ recommended)
-   BrighterScript V1

---

## 📄 License

Rotor is MIT licensed. See `LICENSE` file for details.

---

© 2025 Rotor Molnar Balazs
