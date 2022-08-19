import { ChatClient, PrivateMessage } from "@twurple/chat";
import { ApiClient } from "@twurple/api";

import robot from "robotjs";

const authProvider = "";

const apiClient = new ApiClient({ authProvider });
const chatClient = new ChatClient({ authProvider, channels: ["lidlrini"] });

chatClient.onMessage(
  async (
    _channel: string,
    _user: string,
    message: string,
    _msg: PrivateMessage
  ) => {
    const keywords = {
      跳躍: "backspace",
      丟槍: "Q",
      開大: "X",
    };
    for (const [msg, key] of Object.entries(keywords)) {
      if (msg === message) return robot.keyTap(key);
    }
  }
);
// http://localhost:43343
