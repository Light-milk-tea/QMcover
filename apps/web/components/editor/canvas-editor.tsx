"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";
import type { CanvasLayer, ImageLayer, ShapeLayer, TextLayer } from "@qmcover/shared";
import { useEditorStore } from "../../lib/editor-store";
import { LayerInspector } from "./layer-inspector";

function useHtmlImage(src: string) {
  const image = useMemo(() => {
    if (!src || typeof window === "undefined") {
      return undefined;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    return img;
  }, [src]);

  return image;
}

function ImageNode({ layer }: { layer: ImageLayer }) {
  const image = useHtmlImage(layer.src);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const selectLayer = useEditorStore((state) => state.selectLayer);

  return (
    <KonvaImage
      id={layer.id}
      image={image}
      x={layer.transform.x}
      y={layer.transform.y}
      width={layer.transform.width}
      height={layer.transform.height}
      rotation={layer.transform.rotation}
      opacity={layer.style.opacity}
      visible={layer.transform.visible}
      draggable={!layer.transform.locked}
      onClick={() => selectLayer(layer.id)}
      onTap={() => selectLayer(layer.id)}
      onDragEnd={(event) =>
        updateLayer(layer.id, {
          transform: { ...layer.transform, x: event.target.x(), y: event.target.y() }
        })
      }
      onTransformEnd={(event) => {
        const node = event.target;
        updateLayer(layer.id, {
          transform: {
            ...layer.transform,
            x: node.x(),
            y: node.y(),
            width: Math.max(10, node.width() * node.scaleX()),
            height: Math.max(10, node.height() * node.scaleY()),
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1
          }
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}

function TextNode({ layer }: { layer: TextLayer }) {
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const selectLayer = useEditorStore((state) => state.selectLayer);

  return (
    <Text
      id={layer.id}
      text={layer.content}
      x={layer.transform.x}
      y={layer.transform.y}
      width={layer.transform.width}
      height={layer.transform.height}
      rotation={layer.transform.rotation}
      fontFamily={layer.style.fontFamily}
      fontSize={layer.style.fontSize}
      fontStyle={layer.style.fontWeight >= 700 ? "bold" : "normal"}
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      strokeWidth={layer.style.strokeWidth}
      shadowColor={layer.style.shadowColor}
      shadowBlur={layer.style.shadowBlur}
      shadowOffsetX={layer.style.shadowOffsetX}
      shadowOffsetY={layer.style.shadowOffsetY}
      lineHeight={layer.style.lineHeight}
      letterSpacing={layer.style.letterSpacing}
      align={layer.style.align}
      visible={layer.transform.visible}
      draggable={!layer.transform.locked}
      onClick={() => selectLayer(layer.id)}
      onTap={() => selectLayer(layer.id)}
      onDragEnd={(event) =>
        updateLayer(layer.id, {
          transform: { ...layer.transform, x: event.target.x(), y: event.target.y() }
        })
      }
      onTransformEnd={(event) => {
        const node = event.target;
        updateLayer(layer.id, {
          transform: {
            ...layer.transform,
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * node.scaleX()),
            height: Math.max(20, node.height() * node.scaleY()),
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1
          }
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}

function ShapeNode({ layer }: { layer: ShapeLayer }) {
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const selectLayer = useEditorStore((state) => state.selectLayer);

  return (
    <Rect
      id={layer.id}
      x={layer.transform.x}
      y={layer.transform.y}
      width={layer.transform.width}
      height={layer.transform.height}
      rotation={layer.transform.rotation}
      fill={layer.style.fill}
      stroke={layer.style.stroke}
      strokeWidth={layer.style.strokeWidth}
      opacity={layer.style.opacity}
      cornerRadius={layer.style.radius}
      visible={layer.transform.visible}
      draggable={!layer.transform.locked}
      onClick={() => selectLayer(layer.id)}
      onTap={() => selectLayer(layer.id)}
      onDragEnd={(event) =>
        updateLayer(layer.id, {
          transform: { ...layer.transform, x: event.target.x(), y: event.target.y() }
        })
      }
    />
  );
}

function renderLayer(layer: CanvasLayer): ReactNode {
  if (layer.type === "image") {
    return <ImageNode key={layer.id} layer={layer} />;
  }

  if (layer.type === "text") {
    return <TextNode key={layer.id} layer={layer} />;
  }

  if (layer.type === "shape") {
    return <ShapeNode key={layer.id} layer={layer} />;
  }

  return layer.children.map(renderLayer);
}

export function CanvasEditor({ projectId }: { projectId?: string }) {
  const document = useEditorStore((state) => state.document);
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const selectLayer = useEditorStore((state) => state.selectLayer);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (!stage || !transformer || !selectedLayerId) {
      transformer?.nodes([]);
      return;
    }

    const node = stage.findOne(`#${selectedLayerId}`);
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedLayerId, document]);

  if (!document) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-slate-500">请选择模板或生成候选封面。</div>;
  }

  const scale = Math.min(760 / document.canvas.width, 620 / document.canvas.height);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="overflow-auto rounded-3xl border border-slate-200 bg-slate-100 p-6">
        <div style={{ width: document.canvas.width * scale, height: document.canvas.height * scale }}>
          <Stage
            ref={stageRef}
            width={document.canvas.width}
            height={document.canvas.height}
            scaleX={scale}
            scaleY={scale}
            onMouseDown={(event) => {
              if (event.target === event.target.getStage()) {
                selectLayer(undefined);
              }
            }}
          >
            <Layer>
              <Rect width={document.canvas.width} height={document.canvas.height} fill={document.backgroundColor} />
              {[...document.layers].sort((a, b) => a.transform.zIndex - b.transform.zIndex).map(renderLayer)}
              <Transformer ref={transformerRef} rotateEnabled enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]} />
            </Layer>
          </Stage>
        </div>
      </div>
      <LayerInspector projectId={projectId} stageRef={stageRef} />
    </div>
  );
}
