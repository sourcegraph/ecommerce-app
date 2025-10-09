import { Category, DeliveryOption, Product } from "./types";
import { getOrCreateTraceparent, updateLastTraceId } from "../lib/trace";
import {
  parseProblemDetails,
  isRetryable,
  ProblemDetails,
} from "../lib/errors";
import { withRetry } from "../lib/retry";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

export class ApiError extends Error {
  constructor(
    message: string,
    public problem: ProblemDetails
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: globalThis.RequestInit = {}
  ): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const traceparent = getOrCreateTraceparent();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          traceparent,
          ...options.headers,
        },
        ...options,
      });

      const responseTraceparent = response.headers.get("traceparent");
      updateLastTraceId(responseTraceparent);

      if (!response.ok) {
        const problem = await parseProblemDetails(response);

        if (problem) {
          throw new ApiError(problem.detail, problem);
        }

        const fallbackProblem: ProblemDetails = {
          type: "about:blank",
          title: "Request Failed",
          status: response.status,
          detail: response.statusText,
          instance: endpoint,
          code: "SERVER.INTERNAL_ERROR",
          request_id: response.headers.get("X-Request-ID") || "",
          trace_id: responseTraceparent?.split("-")[1] || "",
        };

        throw new ApiError(response.statusText, fallbackProblem);
      }

      return response.json();
    };

    return withRetry(
      makeRequest,
      (error) => {
        if (error instanceof ApiError) {
          return isRetryable(error.problem);
        }
        return false;
      }
    );
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/api/categories");
  }

  async getDeliveryOptions(): Promise<DeliveryOption[]> {
    return this.request<DeliveryOption[]>("/api/delivery-options");
  }

  async getProducts(params: {
    categoryId?: string;
    deliveryOptionId?: string;
    sort?: string;
  } = {}): Promise<Product[]> {
    const searchParams = new globalThis.URLSearchParams();
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.deliveryOptionId)
      searchParams.set("deliveryOptionId", params.deliveryOptionId);
    if (params.sort) searchParams.set("sort", params.sort);

    return this.request<Product[]>(`/api/products?${searchParams.toString()}`);
  }
}

export const api = new ApiClient();
