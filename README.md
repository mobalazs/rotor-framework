# Rotor Framework
[![Coverage Status](https://coveralls.io/repos/github/mobalazs/rotor-framework/badge.svg?branch=main&v=2)](https://coveralls.io/github/mobalazs/rotor-framework?branch=main)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/mobalazs/rotor-framework)](https://github.com/mobalazs/rotor-framework/packages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Slack](https://img.shields.io/badge/Slack-RokuDevelopers-4A154B?logo=slack)](https://rokudevelopers.slack.com)

**Rotor** is a modular, ViewModel-first UI framework for Roku applications built with BrighterScript and SceneGraph. It is lightweight and designed to intuitively speed up development time while simplifying both the implementation and long-term maintenance process. It features a rich ViewBuilder system and a Roku-friendly implementation of the MVI (Model-View-Intent) design pattern. It helps developers structure large-scale apps with reusable components, state-driven logic, and optimized rendering.

[🌱](#token-efficient-documentation-for-ai)

---

## 🚀 Key Features

-   **ViewBuilder system**: Declarative and extensible view construction with a flexible, code-based template system, automatic full lifecycle management, and a virtual node tree abstraction.
-   **Roku-friendly MVI design pattern**: Predictable state, clear separation of concerns, and cross-thread compatibility.
-   **Component-based UI**: Isolated, reusable UI widgets and view models.
-   **i18n support**: Locale-aware interface with flexible language resource injection.
-   **Integrated** [Animate](https://github.com/haystacknews/animate) Library 


---

## 📦 Installation

### Prerequisites

Rotor Framework requires BrighterScript v1. Install the latest version:

```bash
npm install --save-dev brighterscript@next @rokucommunity/bslint@next
```

### Install Rotor Framework

1. Download the latest `rotor-framework.zip` from [GitHub Releases](https://github.com/mobalazs/rotor-framework/releases)
2. Extract the ZIP into your project's `source/` directory (this will create a `rotor-framework/` folder)
3. Import Rotor in your main file:

```vb
import "pkg:/source/RotorFramework.bs"
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

<a id="token-efficient-documentation"></a>
## Token-efficient documentation for AI

You can find [🌱](./docs/ai/readme.opt.yaml) symbols in all documentation pages. These symbols link to AI-optimized summaries of the respective documentation.

**📖 [Read more about token savings](./docs/token-efficient-docs.md)**


---

## 📚 Learn More
![Version](https://img.shields.io/badge/version-v0.3.0-blue?label=Documents%20TAG)

### Framework Core

-   [Framework Initialization](./docs/framework-initialization.md) - Configuration, task synchronization

### ViewBuilder Reference

-   [ViewBuilder Overview](./docs/view-builder-overview.md) - High-level architecture and core concepts
-   [Widget Reference](./docs/view-builder-widget-reference.md) - Complete Widget properties, methods, and usage patterns
-   [ViewModel Reference](./docs/view-builder-viewmodel-reference.md) - Complete ViewModel structure, lifecycle, and state management

### ViewBuilder Plugins

-   [ViewBuilder Fields Plugin](./docs/view-builder-fields-plugin.md) - Field management and binding
-   [ViewBuilder FontStyle Plugin](./docs/view-builder-fontstyle-plugin.md) - Typography and styling
-   [ViewBuilder Observer Plugin](./docs/view-builder-observer-plugin.md) - State observation patterns
-   [ViewBuilder Focus Plugin](./docs/view-builder-focus-plugin.md) - Focus management system

### MVI Documentation

-   [Cross-Thread MVI design pattern](./docs/cross-thread-mvi.md) - State management across threads

### i18N Documentation

-   [Internationalization support](./docs/i18n-support.md) - Locale-aware interface implementation

---

## 🔧 Requirements

-   Roku SceneGraph (firmware 10.5+ recommended)
-   BrighterScript V1

---

## 📄 License

Rotor is MIT licensed. See [LICENSE.md](./LICENSE.md) file for details.

---

© 2025 Rotor Molnar Balazs
