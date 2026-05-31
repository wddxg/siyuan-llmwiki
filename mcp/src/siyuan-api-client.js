import http from "node:http";
import https from "node:https";

export class SiYuanClient {
  constructor(config) {
    this.baseUrl = config.url;
    this.token = config.token;
    this.tlsAllowSelfSigned = config.tlsAllowSelfSigned;
    this.tlsAllowedHosts = config.tlsAllowedHosts || [];
    const parsed = new URL(this.baseUrl);
    this.protocol = parsed.protocol;
    this.hostname = parsed.hostname;
    this.port = parsed.port || (this.protocol === "https:" ? "443" : "80");
  }

  async request(endpoint, payload = {}) {
    const options = {
      hostname: this.hostname,
      port: this.port,
      path: endpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (this.token) {
      options.headers.Authorization = `Token ${this.token}`;
    }

    if (this.protocol === "https:") {
      const allowSelfSigned = this.tlsAllowSelfSigned && this.tlsAllowedHosts.includes(this.hostname);
      options.agent = new https.Agent({ rejectUnauthorized: !allowSelfSigned });
    }

    const body = JSON.stringify(payload);
    options.headers["Content-Length"] = Buffer.byteLength(body);

    const driver = this.protocol === "https:" ? https : http;

    return await new Promise((resolve, reject) => {
      const req = driver.request(options, (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = raw ? JSON.parse(raw) : {};
            if (parsed.code !== undefined && parsed.code !== 0) {
              reject(new Error(parsed.msg || `SiYuan API error code=${parsed.code}`));
              return;
            }
            resolve(parsed.data !== undefined ? parsed.data : parsed);
          } catch (error) {
            reject(new Error(`Failed to parse SiYuan response: ${error.message}`));
          }
        });
      });
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }

  async checkStatus() {
    return await this.request("/api/system/version", {});
  }

  async listNotebooks() {
    const result = await this.request("/api/notebook/lsNotebooks", {});
    return result?.notebooks || result || [];
  }

  async createNotebook(name) {
    const result = await this.request("/api/notebook/createNotebook", { name });
    return result?.notebook || result;
  }

  async openNotebook(notebook) {
    return await this.request("/api/notebook/openNotebook", { notebook });
  }

  async getNotebookConf(notebook) {
    return await this.request("/api/notebook/getNotebookConf", { notebook });
  }

  async sql(stmt) {
    return await this.request("/api/query/sql", { stmt });
  }

  async createDoc(notebook, path, markdown) {
    return await this.request("/api/filetree/createDocWithMd", {
      notebook,
      path,
      markdown
    });
  }

  async renameDoc(notebook, path, title) {
    return await this.request("/api/filetree/renameDoc", {
      notebook,
      path,
      title
    });
  }

  async getHPathById(id) {
    return await this.request("/api/filetree/getHPathByID", { id });
  }

  async getIdsByHPath(notebook, path) {
    return await this.request("/api/filetree/getIDsByHPath", {
      notebook,
      path
    });
  }

  async getPathById(id) {
    return await this.request("/api/filetree/getPathByID", { id });
  }

  async removeDocById(id) {
    return await this.request("/api/filetree/removeDocByID", { id });
  }

  async removeDoc(notebook, path) {
    return await this.request("/api/filetree/removeDoc", { notebook, path });
  }

  async getDoc(id, mode = 2) {
    return await this.request("/api/filetree/getDoc", {
      id,
      mode,
      size: 102400
    });
  }

  async exportMarkdownContent(id) {
    return await this.request("/api/export/exportMdContent", { id });
  }

  async updateBlock(id, data, dataType = "markdown") {
    return await this.request("/api/block/updateBlock", {
      id,
      data,
      dataType
    });
  }

  async insertBlock(parentID, data, dataType = "markdown") {
    return await this.request("/api/block/insertBlock", {
      parentID,
      data,
      dataType
    });
  }

  async appendBlock(parentID, data, dataType = "markdown") {
    return await this.request("/api/block/appendBlock", {
      parentID,
      data,
      dataType
    });
  }

  async setBlockAttrs(id, attrs) {
    return await this.request("/api/attr/setBlockAttrs", { id, attrs });
  }
}
