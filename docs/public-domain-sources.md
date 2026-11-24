# Public-domain picture sources

Where to find pictures the site can use without paying or asking: post pictures, margin portraits, explainer cut-outs and metaphor thumbnails. Most are public domain or CC0, so they need no license link (the margin caption can't hold one).

**Thumbnails still need a Commons file**, because `tests/work-thumbnails.test.ts` requires a `commons.wikimedia.org` credit. Most public-domain images from the Met, the Library of Congress, NASA, the National Gallery of Art and the Smithsonian are mirrored on Commons: when you find one elsewhere, search Commons for its title or object number and use that copy.

## Checking the license

Check each file on its own page. The search result's label can be wrong.

- **Use it:** Public Domain Mark, CC0, "No known restrictions", or a US federal government work.
- **Skip it:** CC BY or CC BY-SA (these need a credit line the site's captions don't carry), "rights reserved", "in copyright", non-commercial (NC), no derivatives (ND), or no rights statement at all.
- **Never use AI-generated pictures**, even free ones.

In the caption, link the file's own page so the source is traceable.

## The libraries

| Library                                                                        | Best for                                                                   | How to search                                                                                                             | License check                                                                                                                                           |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Wikimedia Commons](https://commons.wikimedia.org)                             | anything, incl. many museum and archive uploads                            | `node scripts/commons-search.mjs <words>` (filters to PD and CC0 for you)                                                 | the license template on the file page                                                                                                                   |
| [Europeana](https://www.europeana.eu)                                          | European museums and archives                                              | `api.europeana.eu/record/v2/search.json` (free key)                                                                       | the record's `rights` field; `reusability=open` also lets CC BY through                                                                                 |
| [Internet Archive](https://archive.org)                                        | scanned books, magazines and ads                                           | `archive.org/advancedsearch.php` (no key)                                                                                 | uploaders set the license themselves: trust known collections and check `licenseurl`                                                                    |
| [Library of Congress](https://www.loc.gov/photos/)                             | US history photos, posters, maps                                           | `loc.gov/photos/?q=...&fo=json` (no key)                                                                                  | the item's Rights Advisory says "No known restrictions on publication"                                                                                  |
| [Smithsonian Open Access](https://www.si.edu/openaccess)                       | objects, natural history, air and space                                    | `api.si.edu/openaccess/api/v1.0/search` (free api.data.gov key)                                                           | the item is marked CC0                                                                                                                                  |
| [Rijksmuseum](https://www.rijksmuseum.nl/en/collection)                        | Dutch masters, prints, ship models; ~840,000 objects, ~740,000 with images | `data.rijksmuseum.nl/search/collection` (no key)                                                                          | the object's image carries the Public Domain Mark; skip `InC` (In Copyright), common on 20th-century works. Metadata is CC0                             |
| [The Met](https://www.metmuseum.org/art/collection/search?showOnly=openAccess) | objects shot on plain backgrounds, ideal for cut-outs                      | `collectionapi.metmuseum.org/public/collection/v1.1/search` (no key; the v1 search was retired 2026-10-01)                | the object's `isPublicDomain` is true                                                                                                                   |
| [NYPL Digital Collections](https://digitalcollections.nypl.org)                | New York, menus, maps, ephemera                                            | the site's search with the "Public domain" filter (the API needs a token)                                                 | marked public domain                                                                                                                                    |
| [NASA Image and Video Library](https://images.nasa.gov)                        | space, launches, Earth from orbit                                          | `images-api.nasa.gov/search` (no key)                                                                                     | NASA's own work is free, but the NASA logo, identifiable people and partner images (ESA, JPL-Caltech, Getty) have their own rules: read the credit line |
| [National Gallery of Art](https://www.nga.gov/open-access-images.html)         | paintings and drawings                                                     | the collection search with the Open Access filter; metadata on [GitHub](https://github.com/NationalGalleryOfArt/opendata) | open access images are CC0                                                                                                                              |

## More libraries worth trying

- [Openverse](https://openverse.org): one search across Commons, Europeana, the Met, the Smithsonian, Flickr and dozens more. Filter to CC0 and public domain. A good first stop.
- [Art Institute of Chicago](https://www.artic.edu/collection?is_public_domain=1): `api.artic.edu/api/v1/artworks/search` (no key). Public domain works are CC0.
- [Cleveland Museum of Art](https://www.clevelandart.org/open-access): `openaccess-api.clevelandart.org/api/artworks/?cc0=1` (no key).
- [SMK, National Gallery of Denmark](https://open.smk.dk): `api.smk.dk/api/v1/art/search/` with a `public_domain:true` filter (no key).
- [Paris Musées](https://parismuseescollections.paris.fr/en): 14 Paris museums. Filter to CC0.
- [Getty Open Content](https://www.getty.edu/art/collection/search?open_content=true): paintings, drawings and early photography.
- [National Archives catalog](https://catalog.archives.gov): US government photos and film. Federal works are public domain.
- [Biodiversity Heritage Library](https://www.biodiversitylibrary.org): plant, animal and science illustrations from old books.
- [Flickr Commons](https://www.flickr.com/commons): photos from museums and archives. "No known copyright restrictions" isn't a license, so check the institution's own page.
- [The Public Domain Review](https://publicdomainreview.org): curated odd and beautiful finds. Each links to its source; check the license there.
