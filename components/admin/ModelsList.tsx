"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import EditModelModal, {
  type AdminModel,
} from "./EditModelModal";
import { useNotifications, type NotificationOptions } from "./NotificationProvider";


interface ModelsListProps {
  refreshKey?: number;
}


const levelOrder = {
  CROWN: 0,
  SSS: 1,
  SS: 2,
  S: 3,
  A: 4,
} as const;


const levels = [
  "CROWN",
  "SSS",
  "SS",
  "S",
  "A",
] as const;


type Model = AdminModel;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string) {
  const safeValue = String(value ?? "").replace(/"/g, '""');
  return `"${safeValue}"`;
}

function buildCsvContent(models: Model[]) {
  const header = [
    "Model Code",
    "Level",
    "Online Status",
    "Introduction",
    "Created At",
  ];

  const rows = models.map((model) => [
    model.code ?? "",
    model.level ?? "",
    model.online ? "Online" : "Offline",
    (model.introduction ?? "").replace(/\r?\n/g, " "),
    model.createdAt ? new Date(model.createdAt).toISOString() : "",
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}

function crc32(value: string) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let j = 0; j < 8; j += 1) {
      crc = (crc & 1) === 1 ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    table[i] = crc >>> 0;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    crc = table[(crc ^ code) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(entries: Array<{ name: string; content: string }>) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  const fileInfos: Array<{ name: string; content: string; size: number }> = [];

  let localOffset = 0;

  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.name);
    const contentBytes = encoder.encode(entry.content);
    const crc = crc32(entry.content);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, contentBytes.length, true);
    localView.setUint32(22, contentBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader);
    localParts.push(contentBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint16(16, 0, true);
    centralView.setUint32(18, crc, true);
    centralView.setUint32(22, contentBytes.length, true);
    centralView.setUint32(26, contentBytes.length, true);
    centralView.setUint16(30, nameBytes.length, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint16(38, 0, true);
    centralView.setUint16(40, 0, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    localOffset += localHeader.length + contentBytes.length;
    fileInfos.push({ name: entry.name, content: entry.content, size: contentBytes.length });
  });

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, entries.length, true);
  eocdView.setUint16(10, entries.length, true);
  eocdView.setUint32(12, centralParts.reduce((sum, part) => sum + part.length, 0), true);
  eocdView.setUint32(16, localOffset, true);
  eocdView.setUint16(20, 0, true);

  const totalSize = localParts.reduce((sum, part) => sum + part.length, 0) + centralParts.reduce((sum, part) => sum + part.length, 0) + eocd.length;
  const zip = new Uint8Array(totalSize);
  let offset = 0;

  localParts.forEach((part) => {
    zip.set(part, offset);
    offset += part.length;
  });

  centralParts.forEach((part) => {
    zip.set(part, offset);
    offset += part.length;
  });

  zip.set(eocd, offset);

  return zip;
}

function buildExcelContent(models: Model[]) {
  const headers = ["Model Code", "Level", "Online Status", "Introduction", "Created At"];
  const rows = models.map((model) => [
    model.code ?? "",
    model.level ?? "",
    model.online ? "Online" : "Offline",
    (model.introduction ?? "").replace(/\r?\n/g, " "),
    model.createdAt ? new Date(model.createdAt).toISOString() : "",
  ]);

  const sheetRows = [headers, ...rows]
    .map((row) => row.map((value) => `<c t="inlineStr"><is><t>${String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</t></is></c>`).join(""))
    .map((cells, index) => `<row r="${index + 1}">${cells}</row>`)
    .join("");

  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Models" sheetId="1" r:id="rId1" />
  </sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml" />
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml" />
</Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />
</Types>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml" />
</Relationships>`;

  return createZip([
    { name: "[Content_Types].xml", content: contentTypes },
    { name: "_rels/.rels", content: rels },
    { name: "xl/workbook.xml", content: workbook },
    { name: "xl/_rels/workbook.xml.rels", content: workbookRels },
    { name: "xl/worksheets/sheet1.xml", content: worksheet },
    { name: "xl/styles.xml", content: styles },
  ]);
}

function exportModels(format: "csv" | "xlsx", models: Model[], addNotification?: (options: NotificationOptions) => void) {
  try {
    if (format === "csv") {
      const csvContent = buildCsvContent(models);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `models-export-${new Date().toISOString().slice(0, 10)}.csv`);
      addNotification?.({
        type: "success",
        title: "CSV export completed",
        message: "The model list has been exported as CSV.",
      });
      return;
    }

    const xlsxBuffer = buildExcelContent(models);
    const blob = new Blob([xlsxBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    downloadBlob(blob, `models-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
    addNotification?.({
      type: "success",
      title: "Excel export completed",
      message: "The model list has been exported as Excel.",
    });
  } catch (error) {
    addNotification?.({
      type: "error",
      title: "Export failed",
      message: error instanceof Error ? error.message : "Unable to export the model list.",
    });
  }
}


export default function ModelsList({
  refreshKey,
}: ModelsListProps) {


  const [models, setModels] =
    useState<Model[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [search, setSearch] =
    useState("");


  const [levelFilter, setLevelFilter] =
    useState("ALL");


  const [statusFilter, setStatusFilter] =
    useState("ALL");


  const [selectedModel, setSelectedModel] =
    useState<Model | null>(null);


  const [modalOpen, setModalOpen] =
    useState(false);


  const [selectedModelIds, setSelectedModelIds] =
    useState<number[]>([]);



  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const { addNotification } = useNotifications();

  async function loadAuditLogs() {
    setAuditLogsLoading(true);

    try {
      const response = await fetch("/api/admin/logs");
      const payload = await response.json();
      const data = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      if (payload?.success === false) {
        setAuditLogs([]);
      } else {
        setAuditLogs(data);
      }
    } catch (error) {
      console.error(error);
      setAuditLogs([]);
    } finally {
      setAuditLogsLoading(false);
    }
  }

  async function logAuditEntry(input: {
    action: string;
    modelCode?: string;
    result?: string;
    description?: string;
    operator?: string;
  }) {
    try {
      await fetch("/api/admin/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: input.action,
          entity: "Model",
          modelCode: input.modelCode ?? null,
          result: input.result ?? "Success",
          description: input.description ?? "Admin action recorded.",
          operator: input.operator ?? "Admin",
          actionLabel: input.action,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function loadModels(
    query = search,
    filter = levelFilter,
    status = statusFilter
  ) {

    setLoading(true);


    try {

      const params =
        new URLSearchParams();


      if(query.trim()) {

        params.set(
          "search",
          query.trim()
        );

      }


      if(
        filter &&
        filter !== "ALL"
      ) {

        params.set(
          "level",
          filter
        );

      }


      if(
        status &&
        status !== "ALL"
      ) {

        params.set(
          "status",
          status
        );

      }


      const response =
        await fetch(
          `/api/models${
            params.toString()
              ? `?${params.toString()}`
              : ""
          }`
        );


      const payload =
        await response.json();

      const data = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      setModels(data);


    } catch(error) {

      console.error(error);

      setModels([]);


    } finally {

      setLoading(false);

    }

  }




  useEffect(() => {


    const timer =
      window.setTimeout(()=>{

        loadModels(
          search,
          levelFilter,
          statusFilter
        );
        loadAuditLogs();

      },250);



    return ()=>{

      window.clearTimeout(timer);

    };


  },[
    search,
    levelFilter,
    statusFilter,
    refreshKey,
  ]);






  function toggleSelectModel(modelId: number) {
    setSelectedModelIds((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  }


  function toggleSelectAll() {
    const visibleIds = models.map((model) => model.id);

    if (
      selectedModelIds.length === visibleIds.length &&
      visibleIds.every((id) => selectedModelIds.includes(id))
    ) {
      setSelectedModelIds([]);
      return;
    }

    setSelectedModelIds(visibleIds);
  }


  async function handleBatchStatusChange(online: boolean) {
    if (selectedModelIds.length === 0) {
      return;
    }

    const selectedModels = models.filter((model) => selectedModelIds.includes(model.id));
    const action = online ? "BATCH_ONLINE" : "BATCH_OFFLINE";
    const actionLabel = online ? "Batch Online" : "Batch Offline";

    try {
      for (const modelId of selectedModelIds) {
        const response = await fetch(`/api/models/${modelId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            online,
          }),
        });

        if (!response.ok) {
          throw new Error("Update status failed");
        }
      }

      await logAuditEntry({
        action,
        modelCode: selectedModels.map((model) => model.code).join(", "),
        result: "Success",
        description: `Admin ${actionLabel.toLowerCase()}d selected profiles.`,
        operator: "Admin",
      });

      await loadModels(search, levelFilter, statusFilter);
      await loadAuditLogs();
      setSelectedModelIds([]);
      addNotification({
        type: "success",
        title: `${actionLabel} completed`,
        message: `Updated ${selectedModels.length} selected profile${selectedModels.length > 1 ? "s" : ""}.`,
      });
    } catch (error) {
      console.error(error);
      await logAuditEntry({
        action,
        modelCode: selectedModels.map((model) => model.code).join(", "),
        result: "Failed",
        description: `Admin failed to ${actionLabel.toLowerCase()} selected profiles.`,
        operator: "Admin",
      });
      await loadAuditLogs();
      addNotification({
        type: "error",
        title: `${actionLabel} failed`,
        message: error instanceof Error ? error.message : "Unable to update the selected profiles.",
      });
    }
  }


  async function handleBatchDelete() {
    if (selectedModelIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedModelIds.length} selected profile${selectedModelIds.length > 1 ? "s" : ""}?`
    );

    if (!confirmed) {
      return;
    }

    const selectedModels = models.filter((model) => selectedModelIds.includes(model.id));

    try {
      for (const modelId of selectedModelIds) {
        const response = await fetch(`/api/models/${modelId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Delete failed");
        }
      }

      await logAuditEntry({
        action: "BATCH_DELETE",
        modelCode: selectedModels.map((model) => model.code).join(", "),
        result: "Success",
        description: "Admin deleted selected profiles.",
        operator: "Admin",
      });

      await loadModels(search, levelFilter, statusFilter);
      await loadAuditLogs();
      setSelectedModelIds([]);
      addNotification({
        type: "success",
        title: "Batch delete completed",
        message: `Deleted ${selectedModels.length} selected profile${selectedModels.length > 1 ? "s" : ""}.`,
      });
    } catch (error) {
      console.error(error);
      await logAuditEntry({
        action: "BATCH_DELETE",
        modelCode: selectedModels.map((model) => model.code).join(", "),
        result: "Failed",
        description: "Admin failed to delete selected profiles.",
        operator: "Admin",
      });
      await loadAuditLogs();
      addNotification({
        type: "error",
        title: "Batch delete failed",
        message: error instanceof Error ? error.message : "Unable to delete the selected profiles.",
      });
    }
  }


  async function toggleOnline(
    model: Model
  ) {

    try {

      const response =
        await fetch(
          `/api/models/${model.id}`,
          {
            method:"PUT",

            headers:{
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                ...model,

                online:
                  !model.online,

              }),

          }
        );



      if(!response.ok){

        throw new Error(
          "Update status failed"
        );

      }



      await logAuditEntry({
        action: model.online ? "TOGGLE_OFFLINE" : "TOGGLE_ONLINE",
        modelCode: model.code,
        result: "Success",
        description: `Admin toggled ${model.code} to ${!model.online ? "online" : "offline"}.`,
        operator: "Admin",
      });

      await loadModels(
        search,
        levelFilter,
        statusFilter
      );
      await loadAuditLogs();
      addNotification({
        type: "success",
        title: "Status updated",
        message: `${model.code} is now ${!model.online ? "online" : "offline"}.`,
      });

    } catch(error){

      console.error(error);
      await logAuditEntry({
        action: model.online ? "TOGGLE_OFFLINE" : "TOGGLE_ONLINE",
        modelCode: model.code,
        result: "Failed",
        description: `Admin failed to toggle ${model.code}.`,
        operator: "Admin",
      });
      await loadAuditLogs();
      addNotification({
        type: "error",
        title: "Status update failed",
        message: error instanceof Error ? error.message : `Unable to toggle ${model.code}.`,
      });
    }

  }





  async function handleDelete(
    model: Model
  ) {


    const confirmed =
      window.confirm(
        `Delete ${model.code}?`
      );


    if(!confirmed)
      return;



    try {


      const response =
        await fetch(
          `/api/models/${model.id}`,
          {
            method:"DELETE",
          }
        );



      if(!response.ok){

        throw new Error(
          "Delete failed"
        );

      }



      await loadModels(
        search,
        levelFilter,
        statusFilter
      );



    }catch(error){

      console.error(error);
      addNotification({
        type: "error",
        title: "Delete failed",
        message: error instanceof Error ? error.message : `Unable to delete ${model.code}.`,
      });
    }

  }






  async function clearAuditLogs() {
    const confirmed = window.confirm("Clear all audit logs?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/admin/logs", { method: "DELETE" });
      if (response.ok) {
        await loadAuditLogs();
        addNotification({
          type: "success",
          title: "Audit log cleared",
          message: "The audit log has been cleared successfully.",
        });
        return;
      }

      throw new Error("Unable to clear audit logs.");
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        title: "Clear failed",
        message: error instanceof Error ? error.message : "Unable to clear the audit log.",
      });
    }
  }

  const groupedModels =
    useMemo(()=>{


      const sorted =
        [...models].sort(
          (a,b)=>{


            const levelCompare =
              levelOrder[
                a.level as keyof typeof levelOrder
              ]
              -
              levelOrder[
                b.level as keyof typeof levelOrder
              ];



            if(levelCompare !==0){

              return levelCompare;

            }


            return (
              a.number -
              b.number
            );

          }
        );



      return levels.map(level=>({

        level,

        list:
          sorted.filter(
            model =>
              model.level === level
          ),

      }));


    },[
      models
    ]);
  return (

    <div className="space-y-8">


      <div className="
        rounded-3xl
        border
        border-yellow-500/20
        bg-[#111111]
        p-6
      ">


        <div className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        ">


          <input

            value={search}

            onChange={(e)=>
              setSearch(
                e.target.value
              )
            }

            placeholder="
              Search by code, title, city or nationality
            "

            className="
              w-full
              rounded-2xl
              border
              border-yellow-500/20
              bg-[#181818]
              px-5
              py-4
              text-white
              md:max-w-xl
            "

          />



          <div className="flex w-full flex-col gap-4 md:max-w-xl md:flex-row">
            <select

              value={levelFilter}

              onChange={(e)=>
                setLevelFilter(
                  e.target.value
                )
              }

              className="
                rounded-2xl
                border
                border-yellow-500/20
                bg-[#181818]
                px-5
                py-4
                text-white
              "

            >

              <option value="ALL">
                All Levels
              </option>


              {
                levels.map(level=>(

                  <option
                    key={level}
                    value={level}
                  >

                    {
                      level==="CROWN"
                      ? "๐‘‘ Crown"
                      : level
                    }

                  </option>

                ))
              }


            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-yellow-500/20 bg-[#181818] px-5 py-4 text-white"
            >
              <option value="ALL">All Status</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>


        </div>


      </div>


      <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="rounded-full border border-yellow-500/30 px-4 py-2 text-sm text-yellow-400"
            >
              {selectedModelIds.length > 0 && selectedModelIds.length === models.length
                ? "Unselect All"
                : "Select All"}
            </button>

            <span className="text-sm text-gray-400">
              {selectedModelIds.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => exportModels("csv", models, addNotification)}
              className="rounded-full border border-yellow-500/30 px-4 py-2 text-sm text-yellow-400"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => exportModels("xlsx", models, addNotification)}
              className="rounded-full border border-yellow-500/30 px-4 py-2 text-sm text-yellow-400"
            >
              Export Excel
            </button>

            <button
              type="button"
              onClick={() => handleBatchStatusChange(true)}
              disabled={selectedModelIds.length === 0}
              className="rounded-full border border-green-500/40 px-4 py-2 text-sm text-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batch Online
            </button>

            <button
              type="button"
              onClick={() => handleBatchStatusChange(false)}
              disabled={selectedModelIds.length === 0}
              className="rounded-full border border-gray-500/40 px-4 py-2 text-sm text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batch Offline
            </button>

            <button
              type="button"
              onClick={handleBatchDelete}
              disabled={selectedModelIds.length === 0}
              className="rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batch Delete
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Audit Log</h2>
            <p className="text-sm text-gray-400">Recent management actions and outcomes</p>
          </div>
          <button
            type="button"
            onClick={clearAuditLogs}
            className="rounded-full border border-yellow-500/30 px-4 py-2 text-sm text-yellow-400"
          >
            Clear Log
          </button>
        </div>

        <div className="max-h-100 overflow-y-auto rounded-2xl border border-yellow-500/10 bg-[#0d0d0d] p-3">
          {auditLogsLoading ? (
            <p className="text-sm text-gray-400">Loading audit log…</p>
          ) : auditLogs.length === 0 ? (
            <p className="text-sm text-gray-400">No audit activity yet.</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => {
                const metadata = (log.metadata && typeof log.metadata === "object" ? log.metadata : {}) as Record<string, unknown>;
                const actionLabel = String(metadata.actionLabel ?? log.action ?? "Admin Action");
                const modelCode = String(metadata.modelCode ?? log.entityId ?? "—");
                const operator = String(metadata.operator ?? "Admin");
                const result = String(metadata.result ?? "Success");
                const time = log.createdAt ? new Date(log.createdAt).toLocaleString() : "—";

                return (
                  <div key={log.id} className="rounded-2xl border border-yellow-500/10 bg-[#181818] p-3 text-sm text-gray-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-white">{actionLabel}</span>
                      <span className={`rounded-full px-2 py-1 text-xs ${result === "Failed" ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                        {result}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>Timestamp: {time}</span>
                      <span>Action Type: {actionLabel}</span>
                      <span>Model Code: {modelCode}</span>
                      <span>Operator: {operator}</span>
                      <span>Result: {result}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {
        groupedModels.map(
          ({
            level,
            list,
          })=>(


          <div
            key={level}
            className="
              rounded-3xl
              border
              border-yellow-500/20
              bg-[#111111]
              p-8
            "
          >


            <div className="
              flex
              items-center
              justify-between
            ">


              <h2 className="
                text-3xl
                font-bold
                text-yellow-500
              ">

                {
                  level==="CROWN"
                  ? "๐‘‘ Collection"
                  : `${level} Collection`
                }

              </h2>


              <span className="
                text-sm
                text-gray-400
              ">

                {list.length} profiles

              </span>


            </div>





            {
              loading ? (

                <p className="
                  mt-6
                  text-gray-400
                ">
                  Loading...
                </p>


              ) : list.length===0 ? (

                <p className="
                  mt-6
                  text-gray-400
                ">
                  No models found.
                </p>


              ) : (


                <div className="
                  mt-8
                  grid
                  gap-6
                  md:grid-cols-2
                  xl:grid-cols-3
                  2xl:grid-cols-4
                ">


                {
                  list.map(model=>(


                    <div
                      key={model.id}
                      className="
                        rounded-2xl
                        border
                        border-yellow-500/20
                        bg-[#1a1a1a]
                        p-6
                      "
                    >


                      <div className="mb-4 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedModelIds.includes(model.id)}
                            onChange={() => toggleSelectModel(model.id)}
                            className="h-4 w-4 rounded border-yellow-500/20 bg-[#181818] accent-yellow-500"
                          />
                          <span>Select</span>
                        </label>
                      </div>

                      <div className="
                        mb-4
                        flex
                        h-40
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        bg-[#222]
                      ">


                        {
                          model.avatar ? (

                            <img
                              src={model.avatar}
                              alt={model.code}
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />

                          ) : (

                            <span className="
                              text-gray-500
                            ">
                              No Avatar
                            </span>

                          )
                        }


                      </div>





                      <div className="
                        space-y-3
                      ">


                        <div className="
                          flex
                          items-center
                          justify-between
                        ">


                          <p className="
                            font-bold
                            text-yellow-500
                          ">

                            {model.code}

                          </p>



                          <button

                            onClick={()=>
                              toggleOnline(model)
                            }

                            className={`
                              rounded-full
                              border
                              px-3
                              py-1
                              text-xs
                              ${
                                model.online
                                ?
                                "border-green-500/40 text-green-400"
                                :
                                "border-gray-500/40 text-gray-400"
                              }
                            `}

                          >

                            {
                              model.online
                              ? "Online"
                              : "Offline"
                            }

                          </button>


                        </div>





                        <p className="
                          text-sm
                          text-white
                        ">

                          {
                            model.title ||
                            "Untitled profile"
                          }

                        </p>





                        <div className="
                          flex
                          gap-2
                          pt-2
                        ">


                          <button

                            onClick={()=>{

                              setSelectedModel(model);

                              setModalOpen(true);

                            }}

                            className="
                              rounded-full
                              border
                              border-yellow-500/30
                              px-4
                              py-2
                              text-yellow-400
                            "

                          >

                            Edit

                          </button>




                          <button

                            onClick={()=>
                              handleDelete(model)
                            }

                            className="
                              rounded-full
                              border
                              border-red-500/40
                              px-4
                              py-2
                              text-red-400
                            "

                          >

                            Delete

                          </button>



                        </div>


                      </div>


                    </div>


                  ))
                }


                </div>


              )

            }


          </div>


          )

        )
      }





      <EditModelModal

        open={modalOpen}

        model={selectedModel}


        onClose={()=>{

          setModalOpen(false);

          setSelectedModel(null);

        }}



        onSaved={()=>{

          loadModels(
            search,
            levelFilter
          );

        }}

      />


    </div>

  );

}
