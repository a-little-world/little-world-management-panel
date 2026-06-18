import {
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  DownloadIcon,
  Button as DSButton,
  Text,
} from '@a-little-world/little-world-design-system';
import { Settings, SlidersHorizontalIcon } from 'lucide-react';
import React from 'react';
import styled from 'styled-components';

import { PageSizeDropdown } from '../atoms/PageSizeDropdown';
import Pagination from '../atoms/Pagination';
import SearchBar from './SearchBar';

interface FiltersToolbarProps {
  children?: React.ReactNode;
  className?: string;
  downloadDisabled?: boolean;
  filtersActive?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  onDownloadClick?: () => void;
  onFiltersClick?: () => void;
  onSearchSubmit?: (search: string) => void;
  onSettingsClick?: () => void;
  paginationList?: any;
  searchDefaultValue?: string;
  searchPlaceholder?: string;
  settingsDisabled?: boolean;
  showDownloadButton?: boolean;
  showFiltersButton?: boolean;
  showPageSizeDropdown?: boolean;
  showPagination?: boolean;
  showSearchBar?: boolean;
  showSettingsButton?: boolean;
  withoutPadding?: boolean;
}

const FiltersContainer = styled.div<{ $withoutPadding?: boolean }>`
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme, $withoutPadding }) =>
    $withoutPadding ? 0 : theme.spacing.small};
  justify-content: space-between;
  flex-wrap: wrap;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
  flex-shrink: 0;
`;

const MiddleSection = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.small};
  min-width: 0;
  flex: 1;
`;

const RightSection = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.large};
  flex-shrink: 0;
  flex-wrap: nowrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    flex-wrap: wrap;
  }
`;

const LoadingSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  width: 100%;
`;

const FilterButton = styled(DSButton)<{ $active: boolean }>`
  ${({ $active, theme }) =>
    $active &&
    `
    border: 1px solid ${theme.color.border.selected};
    &:before {
      content: '';
      display: inline-block;
      position: absolute;
      top: -1px;
      right: -2px;
      width: 15px;
      height: 15px;
      border-radius: ${theme.radius.full};
      background-color: ${theme.color.surface.highlight};
      color: ${theme.color.text.primary};
    }
  `}
`;

export const FiltersToolbar: React.FC<FiltersToolbarProps> = ({
  showSearchBar = false,
  searchPlaceholder = 'Search...',
  searchDefaultValue,
  onSearchSubmit,
  showFiltersButton = false,
  filtersActive = false,
  onFiltersClick,
  showDownloadButton = false,
  downloadDisabled = false,
  onDownloadClick,
  showSettingsButton = false,
  settingsDisabled = false,
  onSettingsClick,
  showPageSizeDropdown = true,
  showPagination = true,
  paginationList,
  className,
  children,
  isLoading = false,
  withoutPadding = false,
  loadingText = 'Loading filters...',
}) => {
  return (
    <FiltersContainer className={className} $withoutPadding={withoutPadding}>
      {(showSearchBar || showFiltersButton || showDownloadButton) && (
        <LeftSection>
          {showSearchBar && onSearchSubmit && (
            <SearchBar
              name="search"
              hideSubmitBtn
              isSubmitting={false}
              onSubmit={({ search }) => onSearchSubmit(search)}
              error={null}
              placeholder={searchPlaceholder}
              defaultValue={searchDefaultValue}
            />
          )}

          {showFiltersButton && onFiltersClick && (
            <FilterButton
              backgroundColor={'black'}
              onClick={onFiltersClick}
              size={ButtonSizes.Small}
              $active={filtersActive}
            >
              <SlidersHorizontalIcon width={16} height={16} /> Filters
            </FilterButton>
          )}

          {showDownloadButton && onDownloadClick && (
            <DSButton
              onClick={onDownloadClick}
              disabled={downloadDisabled}
              variation={ButtonVariations.Circle}
              appearance={ButtonAppearance.Secondary}
              color={'black'}
            >
              <DownloadIcon width={16} height={16} label="download icon" />
            </DSButton>
          )}

          {showSettingsButton && onSettingsClick && (
            <DSButton
              onClick={onSettingsClick}
              disabled={settingsDisabled}
              variation={ButtonVariations.Circle}
              appearance={ButtonAppearance.Secondary}
              color={'black'}
            >
              <Settings size={16} />
            </DSButton>
          )}
        </LeftSection>
      )}

      <MiddleSection>
        {isLoading ? (
          <LoadingSection>
            <Text>{loadingText}</Text>
          </LoadingSection>
        ) : (
          children
        )}
      </MiddleSection>
      {showPagination && (
        <RightSection>
          {showPageSizeDropdown && <PageSizeDropdown />}
          <Pagination list={paginationList} isLoading={isLoading} />
        </RightSection>
      )}
    </FiltersContainer>
  );
};

export default FiltersToolbar;
