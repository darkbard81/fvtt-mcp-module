import { Router } from "./baseRouter";
import { ModuleLogger } from "../../utils/logger";
import { parseFilterString, matchesAllFilters } from "../../utils/search";

export const router = new Router("searchRouter");

router.addRoute({
  actionType: "search-tokens",
  handler: async (data, context) => {
    const socketManager = context?.socketManager;
    ModuleLogger.info(`Received request for roll data`);

    const tokenLayer = canvas?.tokens ?? game.canvas?.tokens;
    if (!tokenLayer) {
      ModuleLogger.error("Canvas tokens layer is unavailable; cannot search tokens.");
      socketManager?.send({
        type: "search-tokens-result",
        requestId: data.requestId,
        error: "Canvas not ready",
        data: []
      });
      return;
    }

    const tokenInfo: any[] = [];
    tokenLayer.placeables.forEach((t: foundry.canvas.placeables.Token) => {
      const actorId = t.document.actorId;
      if (!actorId) return;

      const actor = game.actors.get(actorId);
      if (!actor) return;

      const ownerIds = Object.entries(actor.ownership ?? {})
        .filter(([, level]) => level === 3)
        .map(([userId]) => userId);

      const owners = ownerIds.map(id => {
        const user = game.users.get(id);
        return { id, name: user?.name };
      });

      tokenInfo.push({
        token: t.document._id,
        name: t.document.name,
        actorId: actor.id,
        x: t.x,
        y: t.y,
        type: actor.type,
        owners
      });
    });

    socketManager?.send({
      type: "search-tokens-result",
      requestId: data.requestId,
      data: tokenInfo
    });
  }
});

router.addRoute({
  actionType: "search",
  handler: async (data, context) => {
    const socketManager = context?.socketManager;
    ModuleLogger.info(`Received search request:`, data);

    try {
      if (!window.QuickInsert) {
        ModuleLogger.error(`QuickInsert not available`);
        socketManager?.send({
          type: "search-result",
          requestId: data.requestId,
          query: data.query,
          error: "QuickInsert not available",
          results: []
        });
        return;
      }

      if (!window.QuickInsert.hasIndex) {
        ModuleLogger.info(`QuickInsert index not ready, forcing index creation`);
        try {
          window.QuickInsert.forceIndex();
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          ModuleLogger.error(`Failed to force QuickInsert index:`, error);
          socketManager?.send({
            type: "search-result",
            requestId: data.requestId,
            query: data.query,
            error: "QuickInsert index not ready",
            results: []
          });
          return;
        }
      }

      let filterFunc = null;
      if (data.filter) {
        const filters = typeof data.filter === 'string' ?
          parseFilterString(data.filter) : data.filter;

        filterFunc = (result: any) => {
          return matchesAllFilters(result, filters);
        };
      }

      const filteredResults = await window.QuickInsert.search(data.query, filterFunc, 200);
      ModuleLogger.info(`Search returned ${filteredResults.length} results`);

      socketManager?.send({
        type: "search-result",
        requestId: data.requestId,
        query: data.query,
        filter: data.filter,
        results: filteredResults.map(result => {
          const item = result.item;

          return {
            documentType: item.documentType,
            folder: item.folder,
            id: item.id,
            name: item.name,
            package: item.package,
            packageName: item.packageName,
            subType: item.subType,
            uuid: item.uuid,
            icon: item.icon,
            journalLink: item.journalLink,
            tagline: item.tagline || "",
            formattedMatch: result.formattedMatch || "",
            resultType: item.constructor?.name
          };
        })
      });
    } catch (error) {
      ModuleLogger.error(`Error performing search:`, error);
      socketManager?.send({
        type: "search-result",
        requestId: data.requestId,
        query: data.query,
        error: (error as Error).message,
        results: []
      });
    }
  }
});
