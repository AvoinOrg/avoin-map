# Avoin Map

An app for visualizing a variety of sustainability-related map data. The app can be explored at https://map.avoin.org.

## Development

The app is built on Next.js and the codebase is mostly Typescript. Clone the repository, set the environmental variables, and run the container using Docker Compose.

The environmental variables can be set in the `.env` file. See `.env.template`.
You need to set **at least** the following variables:

```
# The URL of the Avoin geoserver, serving map data.
NEXT_PUBLIC_GEOSERVER_URL=https://gis.example.org/geoserver

# Needed for translations.
NEXT_PUBLIC_TOLGEE_API_URL=
NEXT_PUBLIC_TOLGEE_API_KEY=
```

In addition, if you develop or test auth -related functionalities, you need the relevant Zitadel and Next Auth variables:

```
NEXT_PUBLIC_ZITADEL_ISSUER=
ZITADEL_CLIENT_ID=
ZITADEL_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

To run the project, you need to have Docker installed. Run with

```
docker compose up
```

The app will be available on localhost at DEV_PORT. The default address is http://localhost:3000.

## App structure

The app uses the App Router structure, introduced in Next.js version 13. See https://nextjs.org/docs/app for a quick introduction.

The app is split into the main app and various applets. Applets are basically self-contained apps that leverage the components and other resources of the main app. The applets reside in their own folders inside the App Router structure, where their individual resources are kept.


### Map

Not surprisingly, the map is the main component. The main library is Maplibre GL JS. A lot of the state management happens in a Zustand store.

### Sidebar

As is typical in Map-based apps, the sidebar is used for most functionalities. This might include toggling on and off layers, logging in and out, viewing reports and graphs, and whatever the various applets aim to accomplish. Each view on the sidebar is a Next.js page with its own url.

### Routing

Routing happens via the folder based structure of Next.js. In addition, paths and links are defined in route-tree objects, which are manipulated by various helper functions to achieve, for example, dynamic links.

### State management

Zustand is used for state management. For the map, user data, ui, the needs of the applets, and various other purposes. Big stores, like the MapStore, are split into slices for easier management.

For queries, we use Tanstack Query.

### User managemenet

The user management and authentication happens via Avoin's Zitadel instance.

### Translations

Translations are provided by Avoin's Tolgee instance. It is recommended to use the Tolgee browser extension to easily manipulate the translations while developing.
