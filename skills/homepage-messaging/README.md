# homepage-messaging

Turns a positioning doc into what the homepage says and in what order: three value propositions on the Messaging House, a section outline with the element each section leads with, the hero template and line, and the element counts check. Hands the lines to `language-market-fit` for the words. `audit` mode reads a live homepage, tags every headline by element, and says which layer is broken: copy, messaging, or positioning.

```
/homepage-messaging build positioning-cravel.md
/homepage-messaging audit https://example.com
```

Runs after `startup-positioning`; refuses to write a hero without its doc.

## Credits

Distilled from the public posts of Fletch PMM (Anthony Pierri, Robert Kaminski): the messaging elements, the Value Proposition Canvas, the Messaging House, the World's Clearest Homepage Template, the hero templates and the homepage evaluation counts. Framework names are theirs; `references/sources.md` links each part to its post. No post text is reproduced.
