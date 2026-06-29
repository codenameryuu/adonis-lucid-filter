# @codenameryuu/adonis-lucid-filter

This addon adds the functionality to filter Lucid Models Adonis JS 7. Inspired by [EloquentFilter](https://github.com/Tucker-Eric/EloquentFilter)

## Requirement

* Adonis Js 7
* Lucid 22 or higher

## Installation

* Install the package

```bash
yarn add @codenameryuu/adonis-lucid-filter
```

* Configure the package

```bash
node ace configure @codenameryuu/adonis-lucid-filter
```

* Make sure to register the provider inside `adonisrc.ts` file.

```typescript
providers: [
  // ...
  () => import('@codenameryuu/adonis-lucid-filter/provider'),
],
commands: [
  // ...
  () => import('@codenameryuu/adonis-lucid-filter/commands')
]
```

## Usage

Make sure in `package.json` file, in `imports` section, you have the following:

```json
"imports": {
  // ...
  "#filters/*": "./app/filters/*.ts"
}
```

You can create a model filter with the following ace command:

```bash
node ace make:filter product
```

Where `product` is the Lucid Model you are creating the filter for. This will create `app/filters/product_filter.ts`

### Defining The Filter Logic

Define the filter logic based on the camel cased input key passed to the `filter()` method.

* Empty strings are ignored
* `setup()` will be called regardless of input
* `_id` is dropped from the end of the input to define the method so filtering `product_id` would use the `product()` method
* Input without a corresponding filter method are ignored
* The value of the key is injected into the method
* All values are accessible through the `this.$input` a property
* All QueryBuilder methods are accessible in `this.$query` object in the model filter class.

To define methods for the following input:

```json
{
  "productCategoryId": 1,
  "name": "Car",
  "price": 100000
}
```

You would use the following methods:

```typescript
import { BaseModelFilter } from '@codenameryuu/adonis-lucid-filter'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Product from '#models/product'

export default class ProductFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Product>

  // Blacklisted methods
  static blacklist: string[] = ['secretMethod']

  // Dropped `_id` from the end of the input
  // Doing this would allow you to have a `company()` filter method as well as a `companyId()` filter method.
  static dropId: boolean = true

  // Doing this would allow you to have a mobile_phone() filter method instead of mobilePhone().
  // By default, mobilePhone() filter method can be called thanks to one of the following input key:
  // mobile_phone, mobilePhone, mobile_phone_id, mobilePhoneId
  static camelCase: boolean = true

  // This will filter 'productCategoryId', 'product_category_id' OR 'productCategory'
  productCategory(id: number) {
    this.$query.where('product_category_id', id)
  }

  name(name: string) {
    this.$query.where('name', 'LIKE', `%${name}%`)
  }

  price(price: number) {
    this.$query.where('price', price)
  }

  secretMethod(secretParameter: any) {
    this.$query.where('some_column', true)
  }
}
```

#### Blacklist

Any methods defined in the `blacklist` array will not be called by the filter.
Those methods are normally used for internal filter logic.

The `whitelistMethod()` methods can be used to dynamically blacklist methods.

Example:

```typescript
setup($query) {
  this.whitelistMethod('secretMethod')
  this.$query.where('is_admin', true)
}
```

> `setup()` not may be async

> **Note:** All methods inside `setup()` will be called every time `filter()` is called on the model

In the example above `secretMethod()` will not be called, even if there is a `secret_method` key in the input object.
In order to call this method it would need to be whitelisted dynamically:

### Applying The Filter To A Model

```typescript
import { compose } from '@adonisjs/core/helpers'
import { Filterable } from '@codenameryuu/adonis-lucid-filter'

import ProductFilter from '#filters/product_filter'

export default class Product extends compose(BaseModel, Filterable) {
  static $filter = () => ProductFilter

  // ...columns and props
}
```

This gives you access to the `filter()` method that accepts an object of input:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'

export default class ProductsController {
  async index({ request }: HttpContext): Promise<Product[]> {
    return Product.filter(request.all()).orderBy('created_at', 'desc')
  }

  // or with paginate method

  async index({ request }: HttpContext): Promise<ModelPaginatorContract<Product>> {
    return Product.filter(request.all()).paginate(1, 10)
  }
}
```

### Dynamic Filters

You can define the filter dynamically by passing the filter to use as the second parameter of the filter() method.
Defining a filter dynamically will take precedent over any other filters defined for the model.

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import ProductFilter from '#filters/product_filter'
import ProductExclusiveFilter from '#filters/product_exclusive_filter'

export default class ProductsController {
  async index({ request, auth }: HttpContext): Promise<Product[]> {
    const filter = auth.user.isAdmin() ? ProductFilter : ProductExclusiveFilter
    return Product.filter(request.all(), filter).orderBy('created_at', 'desc')
  }
}
```

### Filtering relations

For filtering relations of model may be use `.query().filter()` or scope `filtration` , example:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import ProductCategory from '#models/product_category'

export default class ProductCategoriesController {
  /**
   * Get a list products of product category
   * GET /product-categories/:product_category_id/products
   */
  async index({ params, request }: HttpContext): Promise<Product[]> {
    const productCategory: ProductCategory = await ProductCategory.findOrFail(
      params.product_category_id
    )

    return productCategory
      .related('products')
      .query()
      .filter(request.all())
      .orderBy('created_at', 'desc')
  }
}
```

Documentation by [Query Scopes](https://lucid.adonisjs.com/docs/model-query-scopes)

**Note:** The relation model must be `Filterable` and `$filter` must be defined in it

## License

This project is [MIT](https://github.com/codenameryuu/adonis-lucid-filter/blob/master/LICENSE.md) licensed.
