# Applet Component Duplication Audit

Date: 2026-07-09

> **Historical source-path notice (2026-07-11):** This dated catalogue was
> written before applet folders were renamed to the retained TanStack Start
> namespaces. Its `src/applets/energiakartta` and `src/applets/hiilikartta`
> paths are historical evidence, not current implementation guidance, and its
> future-work suggestions are superseded until they are revalidated against
> `src/applets/energy` and `src/applets/carbon`. See `README.md` and
> `docs/tanstack-start-route-conventions.md` for current ownership. No F070.3
> component migration is implemented by this notice.

## Scope

This is a catalogue-only audit of applet-local UI and component patterns under
`src/applets/*` that may duplicate shared components under `src/components`.
It focuses on applet-to-shared-component reuse opportunities and intentionally
does not cover general migration residue, stale files, font constants, visual
baseline coverage, fixture changes, or generated translation exports.

No product code was changed for this audit. All cleanup directions below are
future-work suggestions.

## Methodology

Inspected shared UI reference areas:

- `src/components/common`
- `src/components/Sidebar`
- `src/components/Map`
- `src/components/Loading`
- `src/components/Modal`

Inspected applet-local UI areas:

- `src/applets/energiakartta`
- `src/applets/forests`
- `src/applets/hiilikartta`
- `src/applets/luonnonmetsakartat`
- `src/applets/main`
- `src/applets/ui-baseline`

Search covered the requested categories by name: dropdowns, buttons,
sidebar-related components, menus, rows, accordions, toggles, text inputs,
loading states, and other shared UI candidates.

## Shared Component Inventory

| Category | Shared components inspected | Notes for comparison |
| --- | --- | --- |
| Dropdowns | `src/components/common/DropDownSelect.tsx`, `DropDownSelectWithLabel.tsx`, `DropDownSelectInset.tsx`, `DropDownSelectMinimal.tsx`, `DropDownMultiSelect.tsx`, `MultiSelectAutocomplete.tsx` | Applets mostly reuse these directly. Thin applet wrappers around column-record selection are the clearest duplication. |
| Buttons | `src/components/common/Button.tsx`, `IconTextButton.tsx`, `BigMenuButton.tsx`, `EyeButton.tsx`, `src/components/Map/MapButton.tsx` | Applets often reuse `Button`, `ButtonBase`, and `IconButton`; custom pressed tiles, metric pills, and file-upload button surfaces remain local. |
| Sidebar-related components | `src/components/Sidebar/SidebarBoundary.tsx`, `SidebarContentBox.tsx`, `SidebarScaffold.tsx`, `SimpleSidebar.tsx`, `SidebarPanelExtension*.tsx`, `SidebarBackgroundContent.tsx` | Newer applets reuse the sidebar shell well. Duplicated patterns are mostly panel tooltip wrappers and loading shells around `SidebarContentBox`. |
| Menus | `src/components/Map/MapButtonMenu.tsx`, `MapButtonStickyMenu.tsx`, `src/components/Map/MapLayerButton/LayerMenuContent.tsx`, `src/components/common/LayerMenuAccordion.tsx` | The main applet still has a local layer menu/accordion stack with similar behavior. |
| Rows | `src/components/common/LayerToggleRow.tsx`, `LayerToggleRowAccordion`, `LayerToggleRowLink`, `IconTextButton.tsx`, `Folder/Folder.tsx` | Layer rows are reused in some applets. Plan/folder/status rows and search-table rows encode applet state and should be treated carefully. |
| Accordions | `src/components/common/CustomAccordion.tsx`, `CustomAccordionSummary.tsx`, `LayerMenuAccordion.tsx`, `LayerToggleRowAccordion`, `src/components/common/NodeFlow/NodeFlowAccordion.tsx` | Main-app layer accordions and hiilikartta zone accordions are the main local comparisons. |
| Toggles | `src/components/common/Switch.tsx`, `SwitchWithLabel.tsx`, `SquishedSwitchWithLabel.tsx`, `CheckBoxWithLabel.tsx` | Applets generally use shared toggles already; custom class/metric toggles are domain visual controls rather than switch duplicates. |
| Text input | `src/components/common/TextFieldWithLabel.tsx`, `TextFieldMultilineWithLabel.tsx`, `NumberInputField.tsx`, `EditableText.tsx` | Applets generally use shared text input components. Search-table and combobox raw inputs are domain-specific candidates, not direct replacements. |
| Loading states | `src/components/Loading/LoadingSpinner.tsx`, `LoadingHorizontal.tsx`, `LoadingModal.tsx` | Applets reuse spinners but repeat sidebar loading wrappers and skeleton block markup. |
| Other shared UI candidates | `src/components/common/Folder/*`, `ColorPickerWithPopover.tsx`, `Legend.tsx`, `LegendBox.tsx`, `LayerLegend.tsx`, `FrameworkImage.tsx`, `SidebarBackgroundContent.tsx`, `NodeFlow/*`, `src/components/Modal/*`, `src/components/Map/MapSearchBar.tsx` | Useful comparison set for applet-local folder cards, legends, import forms, modal/gallery surfaces, and search controls. |

## Applet Coverage Matrix

| Applet | Dropdowns | Buttons | Sidebar-related | Menus / rows / accordions | Toggles / text input | Loading states | Audit outcome |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `energiakartta` | Uses shared filter dropdowns; building panel uses shared inset dropdowns. | Has custom class tiles, metric buttons, and footer action controls. | Uses shared sidebar extension slots and content boxes. | Uses shared layer rows; class definitions and metric rows are local. | Uses shared switches; class filters are custom visual toggles. | Uses shared loading primitives inside panel surfaces. | Mostly good shared reuse; tooltip wrapper and domain tiles are catalogue candidates. |
| `forests` | Uses shared labelled dropdowns for area controls. | Uses shared icon buttons; local graph action tooltip wrapper exists. | Uses shared sidebar extension provider, action rail, and background content. | Local selected-area summary/table rows are domain-specific. | Uses shared switches. | Chart/loading behavior is mostly graph-specific. | Good shared reuse; tooltip wrapper and graph/table row patterns are documented. |
| `hiilikartta` | Thin wrappers around shared dropdowns, especially import code-record selects. | Many shared buttons plus local upload fields, segmented chart buttons, and flow actions. | Uses shared sidebar content/background and NodeFlow components. | Plan rows, folders, zone accordions, report rows, and action footers inspected. | Uses shared text and number inputs; zoning edit rows are domain-specific. | Uses shared spinner plus repeated skeleton/sidebar loading blocks. | Several future cleanup candidates, especially cross-applet import controls and tooltip wrappers. |
| `luonnonmetsakartat` | Shared dropdowns are used broadly; import code-record select mirrors hiilikartta. | Shared buttons are common; local admin footers, search row buttons, and combobox clear controls remain. | Uses shared sidebar boxes and row primitives. | Folayer rows reuse shared layer rows; search table and import image rows are local. | Uses shared text inputs, switches, and color picker; single-select combobox is local. | `LoadingBlocker` repeats a sidebar spinner shell. | Clear reuse in layer rows; cross-applet import controls and loading wrappers are future candidates. |
| `main` | No major dropdown duplication found. | Local row buttons are embedded in old layer accordion components. | Uses shared sidebar content box; newer landing sidebar behavior is custom. | Local `Menu` and `Accordion/*` overlap with shared layer-menu and row primitives. | No notable text input or toggle duplication in the inspected menu stack. | No notable loading duplication in the inspected menu stack. | Main local layer menu is the largest shared-component comparison. |
| `ui-baseline` | Exercises shared dropdown components intentionally. | Exercises shared button/toggle components intentionally. | Exercises shared sidebar and panel extension components intentionally. | Exercises shared NodeFlow and component examples intentionally. | Exercises shared text inputs intentionally. | Exercises shared loading modal intentionally. | Fixture-only applet; local state wrappers should remain fixture helpers. |

## Finding Catalogue

| ID | Category | Applet path(s) | Nearest shared component(s) | Similarity | Differences / constraints | Suggested future cleanup | Priority | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ACDA-01 | Other shared UI candidate: tooltip wrappers; also affects buttons and sidebar-related actions | `src/applets/energiakartta/pages/page.tsx` (`PageTooltip`), `src/applets/energiakartta/components/BuildingInfoPanel.tsx` (`BuildingInfoInlineTooltip`), `src/applets/forests/page.tsx` (`ForestsTooltip`, `ForestsInfoTooltip`), `src/applets/hiilikartta/components/PlanFolder.tsx` (`DisabledSaveTooltip`), `src/applets/hiilikartta/pages/kaavat/plan/page.tsx` (`InfoButton`), `src/applets/hiilikartta/pages/kaavat/plan/_components/PlanReportFlowStep.tsx` (`DisabledReportTooltip`), `src/applets/hiilikartta/pages/kaavat/plan/alueet/page.tsx` (`DisabledZoneCalculateTooltip`), `src/applets/luonnonmetsakartat/components/FolayerImportPictures.tsx` (`FolderNameTooltip`) | `src/components/Sidebar/SidebarPanelExtensionTooltip.tsx`, tooltip behavior embedded in `src/components/Map/MapButton.tsx` and map button menu surfaces | Repeated Base UI tooltip composition with trigger, portal, popup, arrow, small text, dark or panel-like surface, and disabled/action explanation behavior. | Trigger elements vary between icon buttons, disabled span wrappers, raw boxes, file/folder controls, and panel action rails. Warning-styled zoning tooltips and chart-specific tooltips have different visual semantics. | Consider extracting a generic shared tooltip wrapper or extending `SidebarPanelExtensionTooltip` for non-sidebar use. Migrate plain action/info/disabled tooltip wrappers first; keep warning/chart-specific variants local unless a matching shared API exists. | High | Medium |
| ACDA-02 | Menus, rows, accordions, buttons | `src/applets/main/components/Menu.tsx`, `src/applets/main/components/Accordion/AccordionItem.tsx`, `src/applets/main/components/Accordion/AccordionLink.tsx`, `src/applets/main/components/Accordion/ImgAccordion.tsx` | `src/components/common/LayerMenuAccordion.tsx`, `src/components/common/LayerToggleRow.tsx`, `src/components/Map/MapLayerButton/LayerMenuContent.tsx`, `src/components/common/EyeButton.tsx` | Main applet local components implement layer/category accordions, visibility rows, image-backed accordion headers, and link rows that resemble shared layer-menu primitives. | The main menu uses older hardcoded content, embedded page links, direct layer-group state, image headers, and custom category content. Shared layer-menu APIs are tied to listed layer groups and map layer button contexts. | Plan a future main menu migration to shared layer-menu/row primitives after confirming visual and route behavior. This should be a focused UI migration, not a broad residue cleanup. | Medium | High |
| ACDA-03 | Dropdowns | `src/applets/hiilikartta/pages/kaavat/plan/_components/PlanImportCodeRecordSelect.tsx`, `src/applets/luonnonmetsakartat/components/FolayerImportCodeRecordSelect.tsx`, call sites in `src/applets/luonnonmetsakartat/components/FolayerImportShp.tsx` and `src/applets/luonnonmetsakartat/components/FolayerUpdateShp.tsx` | `src/components/common/DropDownSelectWithLabel.tsx` | Both wrappers map imported file columns into dropdown options, support empty selection, pass through labelled dropdown props, and handle import-field callbacks. | Luonnonmetsakartat includes label fallback handling, long-option rendering, and placeholder behavior. Hiilikartta uses plan-specific column shape and success indicator needs. Translation namespaces and empty value semantics differ. | Consider a shared `ImportCodeRecordSelect` or `ColumnRecordSelect` with render-option, placeholder, namespace, and empty-value props. Migrate both applets only after comparing import validation requirements. | High | Low-Medium |
| ACDA-04 | Buttons and rows | `src/applets/hiilikartta/pages/kaavat/plan/_components/PlanImportActionsRow.tsx`, `src/applets/luonnonmetsakartat/components/FolayerImportActionsRow.tsx` | `src/components/common/Button.tsx` | Both create a compact import action row around a shared `Button`, with disabled handling and an accept/continue action aligned within an import form. | Visual treatment differs: hiilikartta uses a contained button, luonnonmetsakartat uses a text-button style with custom hover/background. Copy, namespaces, and form spacing differ. | Consider an applet-agnostic import action row only if future import forms continue to repeat this layout. Otherwise keep the current wrappers and align styles opportunistically during import-form work. | Medium | Low |
| ACDA-05 | Buttons, rows, loading states, sidebar-related flow controls | `src/applets/hiilikartta/pages/kaavat/plan/page.tsx`, `src/applets/hiilikartta/pages/kaavat/plan/_components/PlanReportFlowStep.tsx`, `src/applets/hiilikartta/pages/kaavat/plan/alueet/page.tsx` | `src/components/common/Button.tsx`, `src/components/common/NodeFlow/NodeFlowButton.tsx`, `src/components/common/NodeFlow/NodeFlowAccordion.tsx`, `src/components/Loading/LoadingSpinner.tsx` | Flow pages combine shared NodeFlow components with local upload fields, disabled info buttons, recalculate buttons, calculate action rows, spinners, and tooltips. | These controls are tightly coupled to plan import state, file input behavior, zoning calculation readiness, and report-generation side effects. Several controls use `ButtonBase` because the whole field or row is clickable, not just a normal button. | Keep the workflow logic local. If tooltip extraction from ACDA-01 lands, migrate disabled/info wrappers first. Consider a shared file-upload field only if another applet repeats the same accessible field-button pattern. | Medium | Medium |
| ACDA-06 | Rows, buttons, loading states | `src/applets/hiilikartta/components/PlanListItem.tsx`, `src/applets/hiilikartta/components/PlanListItemLoading.tsx`, `src/applets/hiilikartta/components/PlanFolder.tsx`, `src/applets/hiilikartta/components/PlanFolderLoading.tsx` | `src/components/common/Folder/Folder.tsx`, `src/components/common/EditableText.tsx`, `src/components/Loading/LoadingSpinner.tsx`, `src/components/common/IconTextButton.tsx` | Plan list and folder components provide reusable-looking card/row/status/loading surfaces and already reuse `Folder`, `EditableText`, and `LoadingSpinner`. | Status badges, cloud-save state, plan routes, folder editing, disabled save logic, and skeleton dimensions are plan-specific. There is no existing shared skeleton-row primitive. | Keep product behavior local. If similar folder/list loading patterns appear in another applet, extract a small shared skeleton block or applet-level plan/folder row helper. | Low-Medium | Medium |
| ACDA-07 | Accordions, rows, dropdowns, text input | `src/applets/hiilikartta/pages/kaavat/plan/alueet/_components/ZoneAccordion.tsx`, `src/applets/hiilikartta/pages/kaavat/plan/alueet/_components/ZoneAccordionItem.tsx` | `src/components/common/DropDownMultiSelect.tsx`, `src/components/common/DropDownSelectMinimal.tsx`, `src/components/common/DropDownSelectWithLabel.tsx`, `src/components/common/TextFieldWithLabel.tsx`, `src/components/common/NumberInputField.tsx`, `src/components/common/Button.tsx`, `src/components/common/CustomAccordion.tsx` | Zone accordion already uses shared dropdowns and text/number inputs while implementing local collapsible row editing, chips, warnings, and nested land-use controls. | Validation, map-feature selection, land-use totals, warning display, geometry state, and domain chips are highly applet-specific. The local row model is more than a generic accordion. | Keep local for now. Future cleanup should only target small reusable pieces such as tooltip styling or a chip-compatible select renderer, not the full zone accordion. | No action | High |
| ACDA-08 | Buttons, toggles, rows, other shared UI candidates | `src/applets/energiakartta/components/EnergyCertificateClassControls.tsx`, `src/applets/energiakartta/components/EnergyClassesAccordionContent.tsx`, `src/applets/energiakartta/components/BuildingInfoPanel.tsx` | `src/components/common/Button.tsx`, `src/components/common/LayerToggleRow.tsx`, `src/components/common/Legend.tsx`, `src/components/common/LayerLegend.tsx`, `src/components/Sidebar/SidebarPanelExtensionTabContainer.tsx` | Energy class tiles, definitions toggle, building metric pills, and submetric rows resemble pressed buttons, legend chips, and toggle rows. Building info already uses shared sidebar page/tab containers. | The color classes, certificate semantics, selected metric state, panel navigation, and comparison values are domain-specific and visually richer than existing shared controls. | Keep local unless another applet needs the same colored pressed-tile or metric-pill pattern. If repeated, extract a narrow shared pressed-tile primitive rather than generalizing the whole building panel. | Low | Medium-High |
| ACDA-09 | Dropdowns and buttons | `src/applets/hiilikartta/components/SelectionMenu.tsx` | `src/components/common/DropDownSelect.tsx` | This is a very thin wrapper around `DropDownSelect` with applet-local prop naming. | The wrapper may exist to stabilize call-site terminology, but it does not add much behavior beyond pass-through props. | Consider replacing call sites with direct `DropDownSelect` use during nearby hiilikartta cleanup. | Low | Low |
| ACDA-10 | Text input, dropdowns, rows, buttons | `src/applets/luonnonmetsakartat/components/SearchTable.tsx` | `src/components/common/DropDownSelectMinimal.tsx`, `src/components/Map/MapSearchBar.tsx`, `src/components/common/Button.tsx`, `src/components/common/TextFieldWithLabel.tsx` | Search table has local search input, sort dropdown, sort-direction button, virtualized row buttons, and selected-row styling. It already reuses `DropDownSelectMinimal` for sorting. | Fuse search, TanStack Table state, react-window virtualization, row selection, and map-selection behavior make this table a domain-specific interaction surface. `MapSearchBar` is a map search surface, not a table filter field. | Keep local. Consider a shared table search/sort shell only if another applet implements the same virtualized selectable-table pattern. | Low | High |
| ACDA-11 | Loading states and sidebar-related components | `src/applets/luonnonmetsakartat/components/LoadingBlocker.tsx`, loading blocks in `src/applets/hiilikartta/pages/kaavat/plan/page.tsx`, `src/applets/hiilikartta/components/PlanListItemLoading.tsx` | `src/components/Loading/LoadingSpinner.tsx`, `src/components/Loading/LoadingHorizontal.tsx`, `src/components/Loading/LoadingModal.tsx`, `src/components/Sidebar/SidebarContentBox.tsx` | Several applets repeat centered loading spinner blocks inside sidebar content or custom skeleton rows. | The exact min heights, skeleton dimensions, and surrounding sidebar/page surfaces vary. Existing shared loading components provide spinners/modals, not a standardized sidebar loading section. | Consider a shared `SidebarLoadingBlock` if more pages need the `SidebarContentBox` plus centered spinner pattern. Keep skeleton row blocks local until a second applet repeats them. | Medium | Low |
| ACDA-12 | Dropdowns, text input, buttons, rows | `src/applets/luonnonmetsakartat/components/FolayerImportPictures.tsx` | `src/components/common/MultiSelectAutocomplete.tsx`, `src/components/common/DropDownSelectWithLabel.tsx`, `IconButton` from `src/components/common/Button.tsx`, `src/components/common/BigMenuButton.tsx` | The picture import flow defines a local searchable single-select combobox, row renderer, tooltip, clear button, and upload action while reusing `IconButton` and `BigMenuButton`. | The combobox is single-select, folder-to-area mapping is workflow-specific, rows are virtualized/mapped to picture folders, and validation copy is import-domain specific. Existing shared autocomplete is multi-select. | Keep local. If another production flow needs a searchable single-select combobox, extract that primitive separately from the picture import workflow. | Low | Medium |
| ACDA-13 | Buttons, rows, loading states | `src/applets/luonnonmetsakartat/pages/admin/taso/folayer/asetukset/page.tsx`, `src/applets/luonnonmetsakartat/pages/admin/taso/folayer/kuvat/page.tsx`, related modal save controls in `src/applets/luonnonmetsakartat/components/AreaModalAdmin.tsx` | `src/components/common/Button.tsx`, `src/components/common/BigMenuButton.tsx`, `src/components/Loading/LoadingSpinner.tsx`, `src/components/Sidebar/SidebarContentBox.tsx` | Admin pages repeat save footer/button styling and loading-disabled behavior while using shared form controls. | Mutation state, route layout, admin permissions, picture upload flow, and modal save behavior differ. The duplication is mostly within one applet, not a repo-wide shared UI gap. | Prefer an applet-local admin form footer/helper before considering a shared component. Do not generalize until another applet needs the same footer. | Medium | Low |
| ACDA-14 | Buttons, menus, rows, accordions | `src/applets/forests/page.tsx`, `src/applets/forests/components/FinlandForestsChart.tsx` | `IconButton` from `src/components/common/Button.tsx`, `src/components/Sidebar/SidebarPanelExtensionProvider.tsx`, `src/components/common/Legend.tsx` | Forests uses shared sidebar and control primitives while implementing chart action buttons, summary table rows, and chart tooltip behavior. | Chart tooltips use Visx chart state, selected-area rows depend on forest area data, and graph panel actions are tied to sidebar-panel runtime state. | Keep chart and table UI local. If ACDA-01 creates a generic tooltip wrapper, evaluate the non-chart action tooltips only. | No action | Medium |

## Keep Local / No Action Entries

| Area | Category | Paths | Reason |
| --- | --- | --- | --- |
| Energiakartta filter accordions | Dropdowns, toggles, accordion content | `src/applets/energiakartta/components/BackgroundBuildingFiltersAccordionContent.tsx`, `src/applets/energiakartta/pages/page.tsx` | Already uses shared `DropDownSelectWithLabel`, `DropDownSelectInset`, `SwitchWithLabel`, `SquishedSwitchWithLabel`, `LayerToggleRow`, and `LayerToggleRowAccordion`. No migration recommended. |
| Energiakartta sidebar extension and building panel shell | Sidebar-related components, buttons | `src/applets/energiakartta/pages/page.tsx`, `src/applets/energiakartta/components/BuildingInfoPanel.tsx` | Already uses shared sidebar extension provider, slots, page containers, tab containers, icon buttons, and inset dropdowns. Keep domain metric panels local. |
| Forests chart internals | Buttons, rows, loading states, other shared UI candidates | `src/applets/forests/components/FinlandForestsChart.tsx` | Chart interactions, Visx tooltip state, and graph rendering are domain-specific. Shared reuse should stay at the surrounding action/button level. |
| Hiilikartta zone editing | Accordions, dropdowns, text input, buttons | `src/applets/hiilikartta/pages/kaavat/plan/alueet/_components/ZoneAccordion.tsx`, `ZoneAccordionItem.tsx` | Already uses shared dropdowns and text/number inputs. The row/accordion behavior encodes zoning validation and map-feature state, so full extraction is not recommended. |
| Hiilikartta action footer | Buttons, rows | `src/applets/hiilikartta/pages/kaavat/plan/_components/PlanActionFooter.tsx` | Uses shared `IconTextButton` and composes plan-specific actions. Keep as local orchestration. |
| Hiilikartta report and graph layout helpers | Rows, buttons, dropdowns | `src/applets/hiilikartta/components/CarbonOverviewGraph/CarbonOverviewGraph.tsx`, `src/applets/hiilikartta/components/CarbonMapGraph/CarbonMapGraph.tsx`, `src/applets/hiilikartta/components/CarbonLineChart/CarbonLineChart.tsx`, `src/applets/hiilikartta/pages/raportti/page.tsx` | Local `Row`/`Col` helpers and segmented chart buttons are report/chart-specific. A shared segmented control could be considered later, but the current components should remain local. |
| Luonnonmetsakartat folayer rows | Rows, buttons | `src/applets/luonnonmetsakartat/components/FolayerItem.tsx`, `src/applets/luonnonmetsakartat/components/AdminFolayerItem.tsx` | Good examples of shared `LayerToggleRow` and `LayerToggleRowLink` reuse. No action. |
| Luonnonmetsakartat import forms | Dropdowns, toggles, text input, buttons | `src/applets/luonnonmetsakartat/components/FolayerImportShp.tsx`, `src/applets/luonnonmetsakartat/components/FolayerUpdateShp.tsx` | Uses shared `TextFieldWithLabel`, `SwitchWithLabel`, `ColorPickerWithPopover`, dropdowns, and `Button`. Only the import wrapper pieces are future candidates. |
| Luonnonmetsakartat modal/gallery surfaces | Buttons, text input, loading states | `src/applets/luonnonmetsakartat/components/AreaModal.tsx`, `src/applets/luonnonmetsakartat/components/AreaModalAdmin.tsx` | Uses shared buttons and form controls where practical. Carousel, gallery, and admin-save behavior are applet-specific. |
| Main landing/sidebar content | Sidebar-related components, buttons | `src/applets/main/components/MainSidebarContent.tsx` | Custom landing-sidebar scroll and bubble navigation behavior is not the same as the layer menu duplication in ACDA-02. Keep local. |
| UI baseline applet | Dropdowns, buttons, sidebar-related components, menus, rows, accordions, toggles, text input, loading states, other shared UI candidates | `src/applets/ui-baseline/pages/*` | This applet is a fixture/showcase for shared components. Local stateful wrappers in `ButtonsTogglesContent.tsx`, `DropdownsContent.tsx`, `InputsContent.tsx`, `PanelsContent.tsx`, `ModalsContent.tsx`, and `NodeFlowContent.tsx` are fixture helpers, not production duplication. |

## Priority Summary

High-priority future candidates:

- ACDA-01 tooltip wrapper consolidation, starting with plain action/info/disabled tooltips.
- ACDA-03 shared import code-record select after comparing hiilikartta and luonnonmetsakartat validation and rendering needs.

Medium-priority future candidates:

- ACDA-02 main applet layer menu migration to shared layer-menu primitives.
- ACDA-04 import action row alignment if import forms continue to repeat.
- ACDA-05 hiilikartta flow action/file-upload controls after tooltip cleanup.
- ACDA-11 sidebar loading block if spinner shells keep repeating.
- ACDA-13 luonnonmetsakartat admin save footer as an applet-local helper.

Low-priority or keep-local candidates:

- ACDA-06 plan/folder row skeletons until another applet repeats them.
- ACDA-07 zone accordion rows because zoning behavior is applet-specific.
- ACDA-08 energy class and building metric controls unless the pressed-tile pattern repeats.
- ACDA-09 thin `SelectionMenu` wrapper as a small opportunistic cleanup.
- ACDA-10 search table because virtualization and map selection dominate the behavior.
- ACDA-12 picture import combobox unless another single-select combobox need appears.
- ACDA-14 forests chart/table UI because it is graph-domain specific.

## Follow-up Feature Suggestions

These are future-work suggestions only:

1. Tooltip consolidation: design a shared non-sidebar tooltip wrapper API and
   migrate the simplest dark action/info wrappers first.
2. Import controls comparison: compare hiilikartta and luonnonmetsakartat import
   forms and extract only the code-record select if the API remains small.
3. Main layer menu migration: evaluate whether the main applet can move from
   local accordion/menu components to `LayerMenuAccordion` and `LayerToggleRow`
   primitives without changing user-visible layer behavior.
4. Sidebar loading block: add a shared loading shell only if a second future
   feature needs the same `SidebarContentBox` plus centered spinner pattern.
