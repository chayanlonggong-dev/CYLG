from pathlib import Path

p = Path("app/api/admin/analytics/route.ts")
t = p.read_text(encoding="utf-8")

old = '} from "@/lib/analytics/filters";\n'
new = '} from "@/lib/analytics/filters";\nimport { classifyTrafficSource } from "@/lib/analytics/trafficSource";\n'
if old not in t:
    raise SystemExit("route.ts: filters import not found (already patched?)")
if "from \"@/lib/analytics/trafficSource\"" not in t:
    t = t.replace(old, new, 1)

old = '      for (const r of rows) {\n        const key = r.referrer || "Direct";\n'
new = '''      for (const r of rows) {
        const classified = classifyTrafficSource({
          referrer: r.referrer,
          userAgent: r.userAgent,
        });
        const key = classified.source;
'''
if old not in t:
    raise SystemExit("route.ts: sourceStats key line not found")
t = t.replace(old, new, 1)

old = '''        .map(([source, e]) => ({
          source,
          visitors: e.visitors.size,
          pageViews: e.pageViews,
          modelViews: e.modelViews,
          contactClicks: e.contactClicks,
          potentialLeads: e.potentialLeads.size,
        }))
'''
new = '''        .map(([source, e]) => {
          const classified = classifyTrafficSource({ referrer: source });
          return {
            source,
            category: classified.category,
            visitors: e.visitors.size,
            pageViews: e.pageViews,
            modelViews: e.modelViews,
            contactClicks: e.contactClicks,
            potentialLeads: e.potentialLeads.size,
          };
        })
'''
if old not in t:
    raise SystemExit("route.ts: sourceStats map not found")
t = t.replace(old, new, 1)

old = '          source: isContactClickPath(r.path) ? "Direct" : r.referrer || "Direct",\n'
new = '''          source: isContactClickPath(r.path)
            ? "Direct"
            : classifyTrafficSource({
                referrer: r.referrer,
                userAgent: r.userAgent,
              }).source,
'''
if old not in t:
    raise SystemExit("route.ts: recent visitor source line not found")
t = t.replace(old, new, 1)

old = "          existing.source = r.referrer;\n"
new = '''          existing.source = classifyTrafficSource({
            referrer: r.referrer,
            userAgent: r.userAgent,
          }).source;
'''
if old not in t:
    raise SystemExit("route.ts: existing.source line not found")
t = t.replace(old, new, 1)

p.write_text(t, encoding="utf-8")
print("OK", p)

p = Path("app/admin/analytics/page.tsx")
t = p.read_text(encoding="utf-8")

old = '''type SourceRow = {
  source: string;
  visitors: number;
'''
new = '''type SourceRow = {
  source: string;
  category?: string;
  visitors: number;
'''
if old not in t:
    raise SystemExit("page.tsx: SourceRow not found")
t = t.replace(old, new, 1)

old = '''                        <th className="py-2">Source</th>
                        <th>Visitors</th>
'''
new = '''                        <th className="py-2">Source</th>
                        <th>Category</th>
                        <th>Visitors</th>
'''
if old not in t:
    raise SystemExit("page.tsx: table header not found")
t = t.replace(old, new, 1)

old = '''                          <td className="py-2 font-medium text-yellow-400">{s.source}</td>
                          <td>{s.visitors}</td>
'''
new = '''                          <td className="py-2 font-medium text-yellow-400">{s.source}</td>
                          <td className="text-gray-400">{s.category || ""}</td>
                          <td>{s.visitors}</td>
'''
if old not in t:
    raise SystemExit("page.tsx: source table cell not found")
t = t.replace(old, new, 1)

p.write_text(t, encoding="utf-8")
print("OK", p)
print("done")
