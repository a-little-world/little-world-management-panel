import {
  Button,
  ButtonSizes,
  TextInput,
} from '@a-little-world/little-world-design-system';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { registerInput } from '../../store';

const SearchBarForm = styled.form``;

const SearchBar = ({
  name,
  hideSubmitBtn,
  onSubmit,
  isSubmitting,
  placeholder,
  error,
  defaultValue,
  searchOnType,
}: {
  defaultValue?: string;
  name: string;
  hideSubmitBtn?: boolean;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  placeholder: string;
  error?: any;
  searchOnType?: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ mode: 'onSubmit' });

  useEffect(() => {
    if (error) setError(name, error);
  }, [error]);

  return (
    <SearchBarForm
      className="flex w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextInput
        {...registerInput({
          register,
          name,
        })}
        id="searchBarInput"
        error={errors?.[name]?.message}
        placeholder={placeholder}
        inline
        onSubmit={handleSubmit(onSubmit)}
        defaultValue={defaultValue}
      />
      {!hideSubmitBtn && (
        <Button type="submit" disabled={isSubmitting} size={ButtonSizes.Small}>
          Add
        </Button>
      )}
    </SearchBarForm>
  );
};

export default SearchBar;
