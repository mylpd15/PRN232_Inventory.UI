export interface AxiosError {
    response: {
        data: {
          message: string;
          path: string;
          statusCode: number;
          timestamp: string;
        };
        status: number;
        config: {
          url: string;
        };
      };
      message: string;
      stack: string;
  }