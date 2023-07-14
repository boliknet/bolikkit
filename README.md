# Bolik Kit

A collection of UI components and integrations.

> Use <https://bolik.net/> to create your own flow: UI + integration combination.


## UI

UI components are Web components that are customizable via properties. CSS is injected with UnoCSS. Each UI component defines a `producesSchema` which is a JSON schema that specifies what this component sends to the backend.

Examples:

* [Contact Form](https://bolik.net/features/contact-form)
* [Poll](https://bolik.net/features/poll)


### UI Development

* `cd ui/forms/poll && deno task dev`


## Integrations

Integrations are Deno functions that receive an HTTP request and process it. Each integration defines an `acceptSchema` property which is a list of accepted JSON schemas this integration can process.
