import axios from 'axios';
import { GetTokenWithSignatureApiRequest, GetTokenWithSignatureApiResponse } from '../pages/api/get-token-with-signature';
import { ProductsApiRequest, ProductsApiResponse } from '../pages/api/ikas/products';
import { AddProductApiRequest, AddProductApiResponse } from '../pages/api/ikas/add-product';
import { CheckForReauthorizeApiResponse } from '../pages/api/oauth/check-for-reauthorize';
import { ApiErrorResponse } from '../globals/types';

/**
 * This is a helper object that holds all api requests that are used by client side.
 * This provides us to use strongly typed request and response data
 */
export const ApiRequests = {
  getTokenWithSignature: (data: GetTokenWithSignatureApiRequest) =>
    makePostRequest<GetTokenWithSignatureApiResponse>({ url: '/api/get-token-with-signature', data }),
  ikas: {
    products: (data: ProductsApiRequest, token: string) => makePostRequest<ProductsApiResponse>({ url: '/api/ikas/products', data, token }),
    addProduct: (data: AddProductApiRequest, token: string) => makePostRequest<AddProductApiResponse>({ url: '/api/ikas/add-product', data, token }),
  },
  oauth: {
    checkForReauthorize: (token: string) => makeGetRequest<CheckForReauthorizeApiResponse>({ url: '/api/oauth/check-for-reauthorize', token }),
  },
};

async function makePostRequest<T>({ url, data, token }: { url: string; data?: any; token?: string }) {
  return axios.post<T | ApiErrorResponse>(url, data, {
    headers: token
      ? {
          Authorization: `JWT ${token}`,
        }
      : undefined,
  });
}

async function makeGetRequest<T>({ url, data, token }: { url: string; data?: any; token?: string }) {
  return axios.get<T | ApiErrorResponse>(url, {
    params: data,
    headers: token
      ? {
          Authorization: `JWT ${token}`,
        }
      : undefined,
  });
}
