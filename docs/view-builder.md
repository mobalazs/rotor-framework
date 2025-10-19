# ViewBuilder Guide

← [Back to Documentation](../README.md#-learn-more)

The Rotor ViewBuilder is the foundation of UI construction in the framework. It provides a declarative and dynamic way to describe Roku SceneGraph node trees entirely from BrightScript code—without relying on XML. This guide explains the core principles and practical usage of the ViewBuilder.

---

## 🧱  Concepts

![Rotor Framework ViewBuilder](images/Rotor_Framework_ViewBuilder.jpeg)

## Widget

In Rotor’s viewBuilder, the smallest UI unit is a **widget**, and every widget is defined by a plain BrightScript **object**. This object describes the intended SceneGraph node and its behavior. The keys of this object each trigger different features: some are core features present in every widget, while others are optional. These additional keys serve to decorate the widget with behavior or styling traits depending on the plugin or concern they represent.

A widget or tree of widgets can be rendered using `frameworkInstance.render(widgetTreeConfig)` where the first argument is an object.

<details>
<summary>Example: Render a widget</summary>

```vb
frameworkInstance.render({
    nodeType: "Rectangle",
    fields: {
        width: 250,
        height: 50,
        translation: [90, 60],
        color: "0x3E6641FF"
    }
})
```

</details>

<details>
<summary>Example: Render a widget with children</summary>

```vb
frameworkInstance.render({
    nodeType: "Rectangle",
    fields: {
        width: 250,
        height: 50,
        translation: [90, 60],
        color: "0x3E6641FF"
    },
    children: {
        nodeType: "Label",
        fields: {
            text: "Hello World!",
            horizAlign: "center",
            vertAlign: "center",
            width: 250,
            height: 50
        }
    }
})
```

</details>

Each widget config object is composed of special keys:

### 📐 Core Keys

These define the fundamental structure and behavior of the widget.  
- 📚 [Core keys](./view-builder-core-howto.md)

| Key        | Description                                                                 |
|------------|-----------------------------------------------------------------------------|
| `id`       | A local identifier used for referencing this widget                         |
| `nodeType` | The SceneGraph node type to create ("Label", "Group", "Poster", "Timer" or any custom SceneGraph components) |
| `children` | A single child object or an array of child widgets                          |
| `zIndex`   | Render-order hint for children                                               |
| `i18n`     | Optional localization metadata or key override                              |



### 🔌 Plugin Keys

These keys invoke specific features provided by external plugins. They are detected dynamically at runtime and matched to active plugins, which extend the widget with additional functionality or appearance based on their specific schema.  
Learn more:  
- 📚 [Font Style Plugin](./view-builder-fontstyle-howto.md)
- 📚 [Fields Plugin](./view-builder-fields-howto.md)
- 📚 [Observer Plugin](./view-builder-observer-howto.md)
- 📚 [Focus Plugin](./view-builder-focus-howto.md)


| Key         | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| `fontStyle` | Injects font configuration using predefined styles from the app theme       |
| `fields`    | Sets SceneGraph fields directly on the node (e.g. `width`, `color`, `uri`). Supports expressions for dynamic values |
| `observer`  | Connects a field (like `text`, `renderTracking`) to a callback. |
| `focus`     | Defines spatial navigation rules and focus behavior for the widget          |



### 💡 Learning Tip
To understand plugin behavior in practice, it's helpful to start with the simplest plugin like `fontStyle`. From there, progress to `fields`, which allows dynamic expression binding. Then move to `observer` to learn how you can observe fields with minimal code. Finally, explore `focus` to manage spatial navigation and more focus related features.

## ViewModel

A **ViewModel** is an extended class of base widget that encapsulates not only layout logic but also local state and behavior. ViewModels expose a `template()` method that returns a widget tree and respond to lifecycle events such as creation and destruction. The `props` and `viewModelState` objects are accessible in every widget that belongs to the same parent ViewModel in the hierarchy.

<details>
<summary>Example: Render a viewModel</summary>

```vb
class ExampleViewModel extends Rotor.ViewModel

    props = {
        title: "Hello, Rotor!"
    }

    viewModelState = {
        isVisible: true
    }

    override function template() as object
        return {
            nodeType: "Rectangle",
            fields: {
                visible: m.viewModelState.isVisible
                width: 250,
                height: 50,
                translation: [90, 60],
                color: "0x3E6641FF"
            },
            children: {
                nodeType: "Label",
                fields: {
                    text: m.props.title,
                    horizAlign: "center",
                    vertAlign: "center",
                    width: 250,
                    height: 50
                }
            }
        }
    end function

end class

frameworkInstance.render({
    viewModel: ExampleViewModel
})
```

</details>
<br>

[Learn more about ViewModel](./view-builder-core-howto.md)




---

## 🔗 Next Steps

Continue reading about:

- 📚 [Core keys](./view-builder-core-howto.md)
- 📚 [Font Style Plugin](./view-builder-fontstyle-howto.md)
- 📚 [Fields Plugin](./view-builder-fields-howto.md)
- 📚 [Observer Plugin](./view-builder-observer-howto.md)
- 📚 [Focus Plugin](./view-builder-focus-howto.md)

