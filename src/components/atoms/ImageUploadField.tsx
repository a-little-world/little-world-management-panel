import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Label,
} from '@a-little-world/little-world-design-system';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

import {
  DropZone,
  EmptyIcon,
  EmptyState,
  EmptySubtitle,
  EmptyTitle,
  FieldError,
  FieldRoot,
  PreviewCaption,
  PreviewClickArea,
  PreviewColumn,
  PreviewFooter,
  PreviewImage,
  RemoveIcon,
  RemoveImageButton,
  VisuallyHiddenInput,
} from './ImageUploadField.styles';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export type ImageUploadFieldProps = {
  /** Stable id for label / input association (falls back to React useId). */
  id?: string;
  label?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** When editing, show the image already stored on the server until a new file is chosen. */
  existingImageUrl?: string | null;
  disabled?: boolean;
  /** Default 5 MB. */
  maxSizeBytes?: number;
  accept?: string;
  helperText?: string;
  /** Tighter layout for dense contexts (e.g. modals). */
  compact?: boolean;
};

function pickFirstImageFile(dataTransfer: DataTransfer | null): File | null {
  if (!dataTransfer?.files?.length) return null;
  const first = dataTransfer.files.item(0);
  return first && first.type.startsWith('image/') ? first : null;
}

function validateImageFile(
  file: File,
  accept: string,
  maxSizeBytes: number,
): string | null {
  if (file.size > maxSizeBytes) {
    const mb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return `Image must be ${mb} MB or smaller.`;
  }
  const allowed = accept
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return null;
  const type = file.type.toLowerCase();
  const ok = allowed.some(rule => {
    if (rule.endsWith('/*')) {
      const prefix = rule.slice(0, -1);
      return type.startsWith(prefix);
    }
    return type === rule;
  });
  if (!ok) {
    return 'Please choose a JPEG, PNG, WebP, or GIF image.';
  }
  return null;
}

/**
 * Accessible image picker with drag-and-drop, preview, and optional existing URL (e.g. edit flow).
 */
export function ImageUploadField({
  id: idProp,
  label = 'Image',
  file,
  onFileChange,
  existingImageUrl = null,
  disabled = false,
  maxSizeBytes = DEFAULT_MAX_BYTES,
  accept = DEFAULT_ACCEPT,
  helperText = 'JPEG, PNG, WebP, or GIF. Drag and drop or click to choose.',
  compact = false,
}: ImageUploadFieldProps) {
  const reactId = useId();
  const inputId = idProp ?? `image-upload-${reactId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const previewSrc = objectUrl ?? existingImageUrl ?? null;
  const hasPreview = Boolean(previewSrc);

  const applyFile = useCallback(
    (next: File | null) => {
      setLocalError(null);
      if (!next) {
        onFileChange(null);
        return;
      }
      const err = validateImageFile(next, accept, maxSizeBytes);
      if (err) {
        setLocalError(err);
        return;
      }
      onFileChange(next);
    },
    [accept, maxSizeBytes, onFileChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null;
    if (next) applyFile(next);
    e.target.value = '';
  };

  const handleClearNewFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    applyFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <FieldRoot>
      <Label bold htmlFor={inputId}>
        {label}
      </Label>

      <VisuallyHiddenInput
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleInputChange}
      />

      <DropZone
        $disabled={disabled}
        $isDragging={isDragging}
        onDragEnter={e => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={e => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (disabled) return;
          const dropped = pickFirstImageFile(e.dataTransfer);
          if (dropped) applyFile(dropped);
          else setLocalError('Please drop a single image file.');
        }}
      >
        {hasPreview ? (
          <PreviewColumn>
            <PreviewClickArea
              $disabled={disabled}
              $compact={compact}
              onClick={() => openPicker()}
              onKeyDown={e => {
                if (disabled) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPicker();
                }
              }}
              role={disabled ? undefined : 'button'}
              tabIndex={disabled ? undefined : 0}
              aria-label="Replace image — opens file dialog"
            >
              <PreviewImage src={previewSrc!} alt="" $compact={compact} />
              {file && !disabled && (
                <RemoveImageButton
                  type="button"
                  onClick={handleClearNewFile}
                  aria-label="Remove selected image"
                >
                  <RemoveIcon strokeWidth={1.75} aria-hidden />
                </RemoveImageButton>
              )}
            </PreviewClickArea>
            <PreviewFooter $compact={compact}>
              <PreviewCaption $compact={compact}>
                {file ? file.name : 'Saved image — click preview to replace'}
              </PreviewCaption>
              {!disabled && (
                <Button
                  type="button"
                  appearance={ButtonAppearance.Secondary}
                  size={ButtonSizes.Small}
                  onClick={e => {
                    e.stopPropagation();
                    openPicker();
                  }}
                >
                  Choose file
                </Button>
              )}
            </PreviewFooter>
          </PreviewColumn>
        ) : (
          <EmptyState $compact={compact}>
            <EmptyIcon strokeWidth={1.5} aria-hidden $compact={compact} />
            <EmptyTitle $compact={compact}>
              Drop an image here or choose a file
            </EmptyTitle>
            <EmptySubtitle $compact={compact}>{helperText}</EmptySubtitle>
            {!disabled && (
              <Button
                type="button"
                appearance={ButtonAppearance.Secondary}
                size={ButtonSizes.Small}
                onClick={openPicker}
              >
                Browse files
              </Button>
            )}
          </EmptyState>
        )}
      </DropZone>

      {localError && <FieldError>{localError}</FieldError>}
    </FieldRoot>
  );
}
