export type RespExistSuggestion = {
  optimization: {
    data: {
      hot_function: boolean;
      process_performance: boolean;
      system_config: boolean;
      system_performance: boolean;
    };
    info: string;
    status: number;
  };
};
