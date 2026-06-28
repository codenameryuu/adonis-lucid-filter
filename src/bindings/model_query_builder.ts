import type { ModelQueryBuilder } from "@adonisjs/lucid/orm";
import type { LucidFilterContract } from "@codenameryuu/adonis-lucid-filter/types/filter";

/**
 * Define filter method to ModelQueryBuilder
 */
export function extendModelQueryBuilder(builder: any) {
  builder.macro("filter", function (this: ModelQueryBuilder, input: any, filter?: LucidFilterContract) {
    const Filter = filter || (this.model as any).$filter();
    return new Filter(this, input).handle();
  });
}
