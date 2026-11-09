# Metaphor photo thumbnails

A new post's thumbnail (its `heroImage`, so also its header and og:image) is a public-domain photo that works as a metaphor for the post, drawn in the site's pink-and-black look by `scripts/generate-work-thumbnails.mjs`. `/write-post` (Phase 7) and `/import-cdata-posts` (step 2) both use this. The script and plan file say "work" because employer posts came first; they draw any post.

## 1. Pick the metaphor

Read the post and name its one idea in plain words, then find a physical, pre-digital thing that does the same job. Existing picks: a switchboard for MCP routing, a Morse key for a chat protocol, a toll gate for an AI gateway. Check `scripts/work-thumbnail-plan.json` so you don't reuse an object. Write down 3-4 candidate objects or scenes before searching. Literal tech (servers, screens, logos, robots, stock "AI brain" art) is out.

## 2. Search Wikimedia Commons

Commons is the only source: the test requires a `commons.wikimedia.org` credit, and only **Public domain** or **CC0** files qualify (no CC BY, no CC BY-SA). Search each candidate:

```bash
q='telephone switchboard operator'   # one candidate per search
curl -s -A 'joekarlsson.com thumbnail search' -G 'https://commons.wikimedia.org/w/api.php' \
  --data-urlencode "gsrsearch=$q filetype:bitmap" \
  -d 'action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=30&prop=imageinfo&iiprop=url|size|extmetadata&iiextmetadatafilter=LicenseShortName' |
python3 -c "
import json,sys
for p in json.load(sys.stdin).get('query',{}).get('pages',{}).values():
  i=p['imageinfo'][0]; lic=i['extmetadata'].get('LicenseShortName',{}).get('value','')
  if ('Public domain' in lic or 'CC0' in lic) and i['width']>=1200:
    print(lic,i['width'],i['height'],i['descriptionurl'])"
```

Old photos (archives, museums, Library of Congress, NASA, US government) are usually public domain and take the pink filter well. Prefer one strong subject with clear contrast: busy scenes turn to mud at 300px.

Download the best 3-4 into the scratchpad (`https://commons.wikimedia.org/wiki/Special:FilePath/<File_name>?width=1600`), Read them, and pick one. Then open its Commons page and confirm the license template says public domain or CC0; don't trust the search metadata alone.

## 3. Pick the look

Neighbors in the feed take different looks. See what sits next to the new post:

```bash
node -e "
const fs=require('fs'),plan=require('./scripts/work-thumbnail-plan.json');
const rows=fs.readdirSync('src/content/blog').filter(f=>f.endsWith('.md')).map(f=>{const t=fs.readFileSync('src/content/blog/'+f,'utf8');return [t.match(/^date:\s*['\"]?([^'\"\n]+)/m)?.[1]??'',f.slice(0,-3)]}).sort().reverse();
for(const [d,s] of rows.slice(0,8)) console.log(d.slice(0,10),(plan[s]?.look??'-').padEnd(6),s)"
```

Pick `flat` or `taped` so it differs from the nearest neighbor that has one, and a `mark` (scribble name and color) that differs from the neighbors' marks.

## 4. Draw it

Add an entry to `scripts/work-thumbnail-plan.json` (fields are documented at the top of `scripts/generate-work-thumbnails.mjs`; copy a neighbor's entry):

```json
"<slug>": {
	"picture": {
		"photo": "https://commons.wikimedia.org/wiki/Special:FilePath/<File_name.jpg>?width=1600",
		"credit": "https://commons.wikimedia.org/wiki/File:<File_name.jpg>"
	},
	"look": "taped",
	"alt": "What the photo shows, plainly",
	"focus": 0.5,
	"mark": { "name": "asterisk", "at": [87, 3, 10, 17], "color": "chalk" },
	"motion": "boil"
}
```

```bash
npm run thumbnails:work -- <slug>
```

The script downloads the photo into `media-sources/work-thumbnails/`, writes `thumb-<hash>.webp`, and sets `heroImage` and `heroAlt`. Read the card. If the subject is cut off, change `focus` (0 top, 1 bottom) and redraw. If it reads as mud, pick another photo. Delete any old `hero.webp` the post no longer references.

Every card boils (`"motion": "boil"`): the photo holds still while the mark and tape boil on the site's 0.5s loop, an animated WebP of about 35-120 KB. A post whose point is a short clip of its own (a reaction GIF, a demo) can play it instead: `"picture": { "video": "...", "at": 2.8, "until": 4.3 }, "motion": "clip"`, at most about 2 seconds since a clip is ~200 KB. Use a chalk mark on bright photos; pink marks vanish into the pink. The build gives every animated card a still for reduced motion and the pause button, and post pages show that still inside the live boiling-paper frame.

Show Joe the card, the metaphor in one line ("a toll gate: every request pays at one gate"), and the Commons link.
