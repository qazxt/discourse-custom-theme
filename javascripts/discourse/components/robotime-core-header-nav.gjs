import Component from "@glimmer/component";

/* global settings */

function parseRobotimeNavLinks(raw) {
  const s = String(raw || "").trim();
  if (!s) {
    return [];
  }
  return s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pair) => {
      const i = pair.indexOf("|");
      if (i <= 0) {
        return null;
      }
      const label = pair.slice(0, i).trim();
      const url = pair.slice(i + 1).trim();
      if (!label || !url) {
        return null;
      }
      return {
        label,
        url,
        is_external: /^https?:\/\//i.test(url),
      };
    })
    .filter(Boolean);
}

export default class RobotimeCoreHeaderNav extends Component {
  get items() {
    try {
      // eslint-disable-next-line no-undef
      const ts = typeof settings !== "undefined" && settings ? settings : {};
      return parseRobotimeNavLinks(ts.robotime_nav_links);
    } catch (e) {
      return [];
    }
  }

  <template>
    {{#if this.items.length}}
      <nav class="robotime-core-header-nav" aria-label="Robotime">
        {{#each this.items as |item|}}
          {{#if item.is_external}}
            <a
              href={{item.url}}
              class="robotime-header__nav-link"
              target="_blank"
              rel="noopener noreferrer"
            >{{item.label}}</a>
          {{else}}
            <a href={{item.url}} class="robotime-header__nav-link">{{item.label}}</a>
          {{/if}}
        {{/each}}
      </nav>
    {{/if}}
  </template>
}
