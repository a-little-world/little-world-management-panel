import { Dropdown } from '@a-little-world/little-world-design-system';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const pageSizeOptions = [
  {
    value: '10',
    label: '10',
  },
  {
    value: '25',
    label: '25',
  },
  {
    value: '50',
    label: '50',
  },
  {
    value: '100',
    label: '100',
  },
];

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

export function PageSizeDropdown() {
  let [searchParams, setSearchParams] = useSearchParams();
  const pageSize = searchParams.get('page_size') || '50';

  const onChangePageSize = (val: string) => {
    searchParams.set('page_size', val);
    setSearchParams(searchParams);
  };

  return (
    <StyledDropdown
      label={'Page Size'}
      value={pageSize}
      options={pageSizeOptions}
      onValueChange={val => onChangePageSize(val)}
      placeholder="Page Size"
      maxWidth="80px"
      cannotError
    />
  );
}
