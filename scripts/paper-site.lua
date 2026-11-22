-- The website's half of a paper's conversion (scripts/sync-paper.mjs), run after the paper's
-- own paper.lua: figures point at the WebP copies under /papers/<slug>/, and tables and figures
-- carry their numbers in the caption ("Table 2."), which LaTeX adds by itself in the PDF.
-- A word joiner after a range's en dash keeps "24–51%" on one line.

local slug

function Meta(meta)
  slug = pandoc.utils.stringify(meta["site-slug"])
end

local function numbered(caption, label, n)
  local lead = pandoc.Strong({ pandoc.Str(label .. " " .. n .. ".") })
  local first = caption.long[1]
  if first then
    first.content:insert(1, pandoc.Space())
    first.content:insert(1, lead)
  end
  return caption
end

local tables, figures = 0, 0

return {
  { Meta = Meta },
  {
    Image = function(img)
      local name = img.src:match("([^/]+)%.%a+$")
      img.src = "/papers/" .. slug .. "/" .. name .. ".webp"
      img.attributes.width = nil
      -- The draft's hand-written alt text, not pandoc's default copy of the caption
      local alt = img.attributes["fig-alt"]
      if alt then
        img.caption = { pandoc.Str(alt) }
        img.attributes["fig-alt"] = nil
      end
      return img
    end,
    Str = function(s)
      local text = s.text:gsub("(%d–)(%d)", "%1\u{2060}%2")
      if text ~= s.text then return pandoc.Str(text) end
    end,
    Table = function(tbl)
      tables = tables + 1
      tbl.caption = numbered(tbl.caption, "Table", tables)
      return tbl
    end,
    Figure = function(fig)
      figures = figures + 1
      fig.caption = numbered(fig.caption, "Figure", figures)
      return fig
    end,
  },
}
