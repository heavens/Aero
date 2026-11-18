import Optional from "./Option";

export type TypedQuery<T> = { readonly [P in keyof T]: T[P] }

export type QueryFunction<K, R> = (query: TypedQuery<K>) => R;

export class Query<Source> {

  /**
   * Constructs a new `Query` using the passed-in `source` value when performing consecutive query operations.
   * @param source The acting model serving as the source of data for the query.
   * @returns The constructed `Query` with the provided `Source` type.
   */
  static using<Source>(source: Source): Query<Source> {
    return new Query(source);
  }

  /**
   * The source datatype used for any select operations done by this query instance.
   */
  private source: Source;

  constructor(source: Source) {
    this.source = source;
  }

  /**
   * Performs a select operation, invoking the provided `QueryFunction` and returning the outcome in the form of an `Optional`.
   * @param query The select operation to be performed, using the associated `Source` as the receiver and returning the outcome whose value with a type denoted by the `Value` typeparam.
   * @returns An `Optional` capable of returning either a value of `Some`, which contains the valid, non-null outcome of the query, otherwise returning `None`. A value of `None`
   * is analogous to a value of `undefined` or `null`.
   */
  public select<Value>(query: QueryFunction<Source, Value | undefined | null>): Optional<Value> {
    const value = query(this.source);
    if (value && value != null) {
      return Optional.Some(query(this.source));
    }

    return Optional.None;
  }
}