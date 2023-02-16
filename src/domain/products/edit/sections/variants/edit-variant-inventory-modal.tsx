import { Product, ProductVariant } from "@medusajs/medusa"
import { useAdminVariantsInventory } from "medusa-react"
import React, { useContext } from "react"
import { useForm } from "react-hook-form"
import Button from "../../../../../components/fundamentals/button"
import Modal from "../../../../../components/molecules/modal"
import LayeredModal, {
  LayeredModalContext,
} from "../../../../../components/molecules/modal/layered-modal"
import EditFlowVariantForm, {
  EditFlowVariantFormType,
} from "../../../components/variant-inventory-form/edit-flow-variant-form"
import useEditProductActions from "../../hooks/use-edit-product-actions"
import { createUpdatePayload } from "./edit-variants-modal/edit-variant-screen"

type Props = {
  onClose: () => void
  product: Product
  variant: ProductVariant
  isDuplicate?: boolean
}

const EditVariantInventoryModal = ({ onClose, product, variant }: Props) => {
  const layeredModalContext = useContext(LayeredModalContext)
  const {
    // @ts-ignore
    variant: variantInventory,
    isLoading: isLoadingInventory,
    refetch,
  } = useAdminVariantsInventory(variant.id)

  const handleClose = () => {
    onClose()
  }

  const { onUpdateVariant, updatingVariant } = useEditProductActions(product.id)

  const onSubmit = (data) => {
    const { location_levels } = data.stock
    console.log({ location_levels })
    /// TODO: Call update location level with new values
    delete data.stock.location_levels
    // @ts-ignore
    onUpdateVariant(variant.id, createUpdatePayload(data), handleClose)
  }

  return (
    <LayeredModal context={layeredModalContext} handleClose={handleClose}>
      <Modal.Header handleClose={handleClose}>
        <h1 className="inter-xlarge-semibold">Edit stock & inventory</h1>
      </Modal.Header>
      {!isLoadingInventory && (
        <StockForm
          variantInventory={variantInventory}
          refetchInventory={refetch}
          onSubmit={onSubmit}
          isLoadingInventory={isLoadingInventory}
          handleClose={handleClose}
          updatingVariant={updatingVariant}
        />
      )}
    </LayeredModal>
  )
}

const StockForm = ({
  variantInventory,
  onSubmit,
  refetchInventory,
  isLoadingInventory,
  handleClose,
  updatingVariant,
}) => {
  const form = useForm<EditFlowVariantFormType>({
    defaultValues: getEditVariantDefaultValues(variantInventory),
  })

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = form

  const handleOnSubmit = handleSubmit((data) => {
    // @ts-ignore
    onSubmit(data)
  })

  const itemId = variantInventory.inventory[0].id
  const locationLevels = variantInventory.inventory[0].location_levels

  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <Modal.Content>
        <EditFlowVariantForm
          form={form}
          refetchInventory={refetchInventory}
          locationLevels={locationLevels}
          itemId={itemId}
          isLoading={isLoadingInventory}
        />
      </Modal.Content>
      <Modal.Footer>
        <div className="flex items-center justify-end w-full gap-x-xsmall">
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={() => {
              reset(getEditVariantDefaultValues(variantInventory))
              handleClose()
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="small"
            type="submit"
            disabled={!isDirty}
            loading={updatingVariant}
          >
            Save and close
          </Button>
        </div>
      </Modal.Footer>
    </form>
  )
}

export const getEditVariantDefaultValues = (
  variantInventory?: any
): EditFlowVariantFormType => {
  const inventoryItem = variantInventory?.inventory[0]
  if (!inventoryItem) {
    return {
      stock: {
        sku: null,
        ean: null,
        inventory_quantity: null,
        manage_inventory: false,
        allow_backorder: false,
        barcode: null,
        upc: null,
        location_levels: null,
      },
    }
  }

  return {
    stock: {
      sku: inventoryItem.sku,
      ean: inventoryItem.ean,
      inventory_quantity: inventoryItem.inventory_quantity,
      manage_inventory: !!inventoryItem,
      allow_backorder: inventoryItem.allow_backorder,
      barcode: inventoryItem.barcode,
      upc: inventoryItem.upc,
      location_levels: inventoryItem.location_levels,
    },
  }
}

export default EditVariantInventoryModal
