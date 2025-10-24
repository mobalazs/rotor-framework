# Rotor Framework Cross-Thread MVI Pattern - Complete Guide

← [Back to Documentation](../README.md#-learn-more)


## Overview

The Cross-Thread MVI (Model-View-Intent) pattern is the heart of the Rotor Framework's state management system. It enables thread-safe communication between the render thread (UI) and task threads (business logic) using a dispatcher-based architecture. This pattern ensures that heavy operations don't block the UI while maintaining synchronized state across threads.

The framework implementation follows the classic structure of the dispatcher, which consists of **model and reducer**, and also implements the classic structure of the reducer, which consists of **middleware and reducer function**.

## The MVI Pattern

### Core Components

1. **Model**: Holds the application state
2. **View**: UI components that display the state (render thread)
3. **Intent**: Actions that describe what should happen
4. **Dispatcher**: Thread-safe communication bridge between render and task threads

![Rotor Framework Cross-Thread MVI](images/cross-thread_MVI.jpeg)


### Thread Architecture

- **Render Thread**: UI components, ViewModels, user interactions
- **Task Thread**: Business logic, API calls, data processing, state mutations
- **Dispatcher**: Synchronizes state between threads safely

## Simple Example: Home Content Loading

Let's walk through a complete example of loading and displaying home content using the Cross-Thread MVI pattern.

### 1. Task Thread Setup

First, we set up the task thread with our state management:

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/taskThread/appTask/appTask.bs
sub task()
    ' Create the home content dispatcher in task thread
    HomeContentModel = new Models.HomeContentModel()
    HomeContentReducer = new Reducers.HomeContentReducer()
    Rotor.createDispatcher("homeContent", HomeContentModel, HomeContentReducer)
    
    ' Start the framework sync loop
    m.appFw.sync() ' Enables thread communication
end sub
```

### 2. Model Definition (Task Thread)

The Model holds our application state:

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/taskThread/appTask/homeContent/homeContentModel.bs
namespace Models
    class HomeContentModel extends Model
        state = {
            contentList: [],    ' List of content items
            cardCount: 0       ' Number of cards to display
        }
    end class
end namespace
```

### 3. Reducer Definition (Task Thread)

The Reducer handles Intents and updates the state:

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/taskThread/appTask/homeContent/homeContentReducer.bs
namespace Reducers
    class HomeContentReducer extends Reducer
        
        override function applyMiddlewares()
            return [
                ' Middleware for async content loading
                function(intent, state) as Intent
                    if intent.type = IntentTypes.ContentReader.LOAD_CONTENT
                        
                        ' Get fetch pool dispatcher for API calls
                        fetchPool = m.getDispatcher("fetchPool")
                        
                        ' Listen for API response
                        fetchPool.addListener({
                            allowUpdate: function(state)
                                return state.requestKey = "home:feed"
                            end function,
                            callbackWithState: sub(state)
                                ' When API responds, dispatch content loaded
                                m.getDispatcher("homeContent").dispatch({
                                    type: IntentTypes.ContentReader.CONTENT_LOADED,
                                    payload: {
                                        response: state.response
                                    }
                                })
                            end sub,
                            once: true  ' Remove listener after first call
                        })
                        
                        ' Trigger API call
                        fetchPool.dispatch({
                            type: IntentTypes.FetchPool.FETCH,
                            payload: {
                                endpoint: "/api/home-feed",
                                requestKey: "home:feed",
                                params: {}
                            }
                        })
                        
                        return invalid  ' Don't continue to reducer
                    end if
                    
                    return intent  ' Continue to reducer
                end function
            ]
        end function
        
        override function reducer(state, intent)
            ' Handle content loaded intent
            if intent.type = IntentTypes.ContentReader.CONTENT_LOADED
                state.contentList = intent.payload.response.contentList
                state.cardCount = intent.payload.response.cardCount
            end if
            
            return state
        end function
    end class
end namespace
```

### 4. View Component (Render Thread)

The View component in the render thread displays the state:

```brightscript
// File: https://github.com/mobalazs/poc-rotor-framework/blob/main/src/components/app/renderThread/viewModels/pages/home/homePage.bs
namespace ViewModels
    class HomePage extends ViewModel
        
        override sub onCreateView()
            ' Get the dispatcher that connects to task thread
            m.homeContentDispatcher = m.getDispatcher("homeContent")
            
            ' Get initial state immediately
            m.homeContentDispatcher.getState(sub(props, state)
                props.contentList = state.contentList
                props.cardCount = state.cardCount
            end sub)
            
            ' Listen for state changes
            m.homeContentDispatcher.addListener({
                mapStateToProps: sub(props, state)
                    props.contentList = state.contentList
                    props.cardCount = state.cardCount
                end sub,
                callback: m.updateHomeCarousel  ' Update UI when state changes
            })
        end sub
        
        override function template() as object
            return {
                nodeType: "Group",
                children: [
                    {
                        id: "viewTitle",
                        nodeType: "Label",
                        fontStyle: UI.fontStyles.H2_aa,
                        fields: {
                            color: UI.colors.white,
                            text: `Home Content (${m.props.cardCount} items)`
                        }
                    },
                    {
                        id: "homeCarousel",
                        viewModel: ViewModels.HomeCarousel,
                        props: {
                            contentList: m.props.contentList
                        }
                    }
                ]
            }
        end function
        
        ' Called when state changes
        sub updateHomeCarousel()
            ' Re-render with new content
            m.render({
                id: "homeCarousel",
                props: {
                    contentList: m.props.contentList
                }
            })
        end sub
    end class
end namespace
```

### 5. Triggering the Flow

The flow starts when a user action dispatches an intent:

```brightscript
// Somewhere in the UI (like a button press or page load)
sub loadHomeContent()
    ' Dispatch intent from render thread
    homeDispatcher = m.getDispatcher("homeContent")
    homeDispatcher.dispatch({
        type: IntentTypes.ContentReader.LOAD_CONTENT
    })
end sub
```

## Flow Walkthrough

Let's trace through what happens when `loadHomeContent()` is called:

### Step 1: Intent Dispatch (Render Thread)
```brightscript
homeDispatcher.dispatch({
    type: IntentTypes.ContentReader.LOAD_CONTENT
})
```
- Intent is sent from render thread to task thread
- Dispatcher queues the intent for processing

### Step 2: Middleware Processing (Task Thread)
```brightscript
// In HomeContentReducer middleware
if intent.type = IntentTypes.ContentReader.LOAD_CONTENT
    // Setup API call listener
    fetchPool.addListener({ ... })
    
    // Trigger API call
    fetchPool.dispatch({
        type: IntentTypes.FetchPool.FETCH,
        payload: { endpoint: "/api/home-feed" }
    })
    
    return invalid  // Don't continue to reducer yet
end if
```
- Middleware intercepts the LOAD_CONTENT intent
- Sets up listener for API response
- Triggers API call through fetchPool
- Returns `invalid` to prevent reducer execution

### Step 3: API Response (Task Thread)
```brightscript
// When API responds, fetchPool listener fires
callbackWithState: sub(state)
    m.getDispatcher("homeContent").dispatch({
        type: IntentTypes.ContentReader.CONTENT_LOADED,
        payload: {
            response: state.response
        }
    })
end sub
```
- API completes and fetchPool state updates
- Listener detects the response
- Dispatches CONTENT_LOADED intent with API data

### Step 4: State Update (Task Thread)
```brightscript
// In HomeContentReducer reducer function
if intent.type = IntentTypes.ContentReader.CONTENT_LOADED
    state.contentList = intent.payload.response.contentList
    state.cardCount = intent.payload.response.cardCount
end if
```
- Reducer updates the model state with API data
- State is now synchronized across threads

### Step 5: UI Update (Render Thread)
```brightscript
// State listener in HomePage ViewModel fires
m.homeContentDispatcher.addListener({
    mapStateToProps: sub(props, state)
        props.contentList = state.contentList
        props.cardCount = state.cardCount
    end sub,
    callback: m.updateHomeCarousel
})
```
- Render thread listener detects state change
- Props are updated with new state values
- Callback triggers UI re-render

### Step 6: Visual Update (Render Thread)
```brightscript
sub updateHomeCarousel()
    m.render({
        id: "homeCarousel",
        props: {
            contentList: m.props.contentList
        }
    })
end sub
```
- UI components re-render with new data
- User sees updated content

## Key Concepts

### Thread Safety
- **All state mutations happen in task thread**: UI never directly modifies state
- **Dispatchers handle synchronization**: Thread-safe communication bridge
- **Immutable state updates**: Each state change creates new state object

### Middleware Pattern
- **Intercept intents**: Middleware can process intents before they reach reducer
- **Async operations**: Perfect for API calls, timers, complex logic
- **Return invalid**: Prevents reducer execution when needed
- **Chain processing**: Multiple middlewares can process same intent

### Listener Pattern
- **mapStateToProps**: Extract relevant data from state
- **allowUpdate**: Filter when listener should fire
- **callback**: Function to call when state changes
- **once**: Remove listener after first execution

### State Flow Direction
```
[Render Thread] � Intent � [Task Thread] � State Update � [Render Thread]
     UI Event              Middleware      Reducer        UI Update
```

## Best Practices

### 1. Keep State in Task Thread
```brightscript
// Good: State mutations in task thread
override function reducer(state, intent)
    if intent.type = "UPDATE_USER"
        state.user = intent.payload.user
    end if
    return state
end function

// Bad: Direct state modification in render thread
// DON'T DO THIS
m.props.user = newUser  // This won't sync across threads
```

### 2. Use Middleware for Async Operations
```brightscript
// Good: Async operations in middleware
function(intent, state) as Intent
    if intent.type = "LOAD_DATA"
        m.apiCall(function(response)
            m.getDispatcher("myData").dispatch({
                type: "DATA_LOADED",
                payload: response
            })
        end function)
        return invalid  // Prevent reducer execution
    end if
    return intent
end function
```

### 3. Efficient State Listeners
```brightscript
// Good: Filter updates with allowUpdate
m.dispatcher.addListener({
    allowUpdate: function(state)
        return state.userId = m.currentUserId  // Only update for relevant user
    end function,
    mapStateToProps: sub(props, state)
        props.userData = state.users[m.currentUserId]
    end sub
})
```

### 4. Clean Intent Types
```brightscript
// Good: Clear, descriptive intent types
IntentTypes = {
    User: {
        LOAD_PROFILE: "USER_LOAD_PROFILE",
        PROFILE_LOADED: "USER_PROFILE_LOADED",
        UPDATE_SETTINGS: "USER_UPDATE_SETTINGS"
    }
}
```

## Threading Benefits

### UI Responsiveness
- Heavy operations run in task thread
- UI thread remains responsive
- Smooth animations and interactions

### Scalability
- Multiple task threads can be created
- Parallel processing of different concerns
- Isolated state management per domain

### Maintainability
- Clear separation of concerns
- Predictable state flow
- Easy to test and debug

The Cross-Thread MVI pattern provides a robust foundation for building complex, responsive Roku applications while maintaining clean architecture and thread safety.
