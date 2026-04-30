import { apiInitializer } from "discourse/lib/api";
import HeaderTopicCell from "discourse/components/topic-list/header/topic-cell";
import RobotimeTopicListThumbnail from "../components/robotime-topic-list-thumbnail";
import RobotimeTopicListTopicCell from "../components/robotime-topic-list-topic-cell";

/* global settings */
export default apiInitializer((api) => {
  // eslint-disable-next-line no-undef
  const ts = typeof settings !== "undefined" && settings ? settings : {};
  const enabled =
    ts.robotime_topic_thumbnails_enabled !== false &&
    ts.robotime_topic_thumbnails_enabled !== "false";
  const metaEnabled =
    ts.robotime_topic_meta_enabled !== false &&
    ts.robotime_topic_meta_enabled !== "false";

  if (!enabled) {
    return;
  }

  function applyRobotimeTopicColumns(columns) {
    if (!columns || typeof columns.has !== "function") {
      return columns;
    }
    const topicKey =
      ["topic", "main_link", "mainLink", "title"].find((k) => columns.has(k)) ||
      null;
    if (!topicKey) {
      return columns;
    }
    const repliesKey =
      ["replies", "activity", "views", "posts"].find((k) => columns.has(k)) ||
      null;

    if (!columns.has("topic-thumbnails")) {
      const opts = topicKey ? { before: topicKey } : undefined;
      columns.add("topic-thumbnails", { item: RobotimeTopicListThumbnail }, opts);
    }

    /* Card body = preview `.topic-content`: title + single footer row (meta + last poster). */
    if (metaEnabled && columns.has(topicKey)) {
      columns.delete(topicKey);
      if (columns.has("posters")) {
        columns.delete("posters");
      }
      const insertOpts = repliesKey ? { before: repliesKey } : undefined;
      columns.add(
        topicKey,
        {
          header: HeaderTopicCell,
          item: RobotimeTopicListTopicCell,
        },
        insertOpts
      );
    }
    return columns;
  }

  api.registerValueTransformer("topic-list-columns", ({ value: columns }) => {
    return applyRobotimeTopicColumns(columns);
  });

  api.registerValueTransformer("mobile-topic-list-columns", ({ value: columns }) => {
    return applyRobotimeTopicColumns(columns);
  });

});
