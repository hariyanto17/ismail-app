import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';
import { RootState } from './store';

const BASE_URL = __DEV__
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001')
  : 'https://kopiwara.168billiard.online';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Category', 'Product', 'Transaction', 'ReportRecipient', 'Setting'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Users
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: '/users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...user }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Categories
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (category) => ({
        url: '/categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...category }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Products
    getProducts: builder.query({
      query: () => '/products',
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation({
      query: (product) => ({
        url: '/products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...product }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Transactions
    getTransactions: builder.query({
      query: () => '/transactions',
      providesTags: ['Transaction'],
    }),
    getTransactionDetail: builder.query({
      query: (id) => `/transactions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
    }),
    createTransaction: builder.mutation({
      query: (transaction) => ({
        url: '/transactions',
        method: 'POST',
        body: transaction,
      }),
      invalidatesTags: ['Transaction'],
    }),
    // Reports
    getDailyReport: builder.query({
      query: (date) => `/reports/daily?date=${date}`,
      providesTags: ['Transaction'],
    }),

    // Report Recipients
    getReportRecipients: builder.query({
      query: () => '/report-recipients',
      providesTags: ['ReportRecipient'],
    }),
    createReportRecipient: builder.mutation({
      query: (recipient) => ({
        url: '/report-recipients',
        method: 'POST',
        body: recipient,
      }),
      invalidatesTags: ['ReportRecipient'],
    }),
    updateReportRecipient: builder.mutation({
      query: ({ id, ...recipient }) => ({
        url: `/report-recipients/${id}`,
        method: 'PUT',
        body: recipient,
      }),
      invalidatesTags: ['ReportRecipient'],
    }),
    deleteReportRecipient: builder.mutation({
      query: (id) => ({
        url: `/report-recipients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReportRecipient'],
    }),
    // Settings
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Setting'],
    }),
    updateSettings: builder.mutation({
      query: (settings) => ({
        url: '/settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Setting'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetTransactionsQuery,
  useGetTransactionDetailQuery,
  useCreateTransactionMutation,
  useGetDailyReportQuery,
  useGetReportRecipientsQuery,
  useCreateReportRecipientMutation,
  useUpdateReportRecipientMutation,
  useDeleteReportRecipientMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = apiSlice;
