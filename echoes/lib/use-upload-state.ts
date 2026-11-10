'use client';
import { useEffect, useRef, useState } from 'react';
import type { Place } from './places';

export function useUploadState() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadRights, setUploadRights] = useState(false);
  // 写真を取り消したときに、元の出発点へ戻すために覚えておく。
  const beforeUploadRef = useRef<Place | null>(null);

  useEffect(
    () => () => {
      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    },
    [uploadPreview],
  );

  return {
    uploadFile,
    setUploadFile,
    uploadPreview,
    setUploadPreview,
    uploadRights,
    setUploadRights,
    beforeUploadRef,
  };
}
