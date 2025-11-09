import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useCabinetStore from '../store/cabinetStore';
import CabinetCalculator from '../services/calculationService';
import './CabinetForm.css';

function CabinetForm() {
  const { 
    cabinetType, 
    width, 
    height, 
    depth, 
    materialThickness,
    actualMaterialThickness,
    joineryType,
    joineryTolerance,
    toeKick,
    backPanel,
    shelves,
    setCabinetType,
    setDimensions,
    setMaterialThickness,
    setJoineryType,
    setJoineryTolerance,
    setToeKick,
    setBackPanel,
    addShelf,
    updateShelf,
    removeShelf,
    setParts
  } = useCabinetStore();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      cabinetType,
      width,
      height,
      depth,
      materialThickness,
      actualMaterialThickness,
      joineryType,
      joineryTolerance,
      toeKickEnabled: toeKick.enabled,
      toeKickHeight: toeKick.height,
      toeKickDepth: toeKick.depth,
      backPanelType: backPanel.type,
      backRailHeight: backPanel.railHeight
    }
  });

  const watchCabinetType = watch('cabinetType');
  const watchToeKickEnabled = watch('toeKickEnabled');
  const watchBackPanelType = watch('backPanelType');
  const watchWidth = watch('width');
  const watchHeight = watch('height');
  const watchDepth = watch('depth');
  const watchMaterialThickness = watch('materialThickness');
  const watchActualMaterialThickness = watch('actualMaterialThickness');
  const watchJoineryType = watch('joineryType');
  const watchJoineryTolerance = watch('joineryTolerance');
  const watchToeKickHeight = watch('toeKickHeight');
  const watchToeKickDepth = watch('toeKickDepth');
  const watchBackRailHeight = watch('backRailHeight');

  // Update store's toeKick state when form values change
  useEffect(() => {
    setToeKick({
      enabled: watchToeKickEnabled,
      height: parseFloat(watchToeKickHeight) || toeKick.height,
      depth: parseFloat(watchToeKickDepth) || toeKick.depth
    });
  }, [watchToeKickEnabled, watchToeKickHeight, watchToeKickDepth, setToeKick, toeKick.height, toeKick.depth]);

  // Recalculate parts when shelves change or form values change
  useEffect(() => {
    // Auto-position shelves proportionally
    if (shelves.length > 0) {
      // Calculate actual side height (accounting for toe kick)
      const actualSideHeight = (watchCabinetType === 'base' && watchToeKickEnabled) 
        ? parseFloat(watchHeight) - parseFloat(watchToeKickHeight)
        : parseFloat(watchHeight);
      
      const updatedShelves = shelves.map((shelf, index) => {
        let position;
        if (shelves.length === 1) {
          // Single shelf at center of the cabinet interior
          position = actualSideHeight / 2;
        } else {
          // Multiple shelves evenly spaced in the cabinet interior
          const segments = shelves.length + 1;
          position = (actualSideHeight / segments) * (index + 1);
        }
        return { ...shelf, position };
      });
      
      // Only update if positions changed
      const positionsChanged = shelves.some((shelf, index) => 
        Math.abs(shelf.position - updatedShelves[index].position) > 0.01
      );
      
      if (positionsChanged) {
        updatedShelves.forEach((shelf, index) => {
          updateShelf(index, { position: shelf.position });
        });
        return; // Exit early to avoid recalculating twice
      }
    }

    const calculator = new CabinetCalculator({
      cabinetType: watchCabinetType,
      width: parseFloat(watchWidth) || width,
      height: parseFloat(watchHeight) || height,
      depth: parseFloat(watchDepth) || depth,
      materialThickness: parseFloat(watchMaterialThickness) || materialThickness,
      actualMaterialThickness: parseFloat(watchActualMaterialThickness) || actualMaterialThickness,
      joineryType: watchJoineryType,
      joineryTolerance: parseFloat(watchJoineryTolerance) || joineryTolerance,
      toeKick: {
        enabled: watchToeKickEnabled,
        height: parseFloat(watchToeKickHeight) || toeKick.height,
        depth: parseFloat(watchToeKickDepth) || toeKick.depth
      },
      backPanel: {
        enabled: watchBackPanelType !== 'none',
        type: watchBackPanelType,
        railHeight: parseFloat(watchBackRailHeight) || backPanel.railHeight
      },
      shelves
    });

    const parts = calculator.calculateParts();
    setParts(parts);
  }, [
    shelves, 
    watchCabinetType, 
    watchWidth, 
    watchHeight, 
    watchDepth, 
    watchMaterialThickness, 
    watchActualMaterialThickness, 
    watchJoineryType, 
    watchJoineryTolerance, 
    watchToeKickEnabled,
    watchToeKickHeight,
    watchToeKickDepth,
    watchBackPanelType,
    watchBackRailHeight,
    updateShelf,
    setParts,
    width,
    height,
    depth,
    materialThickness,
    actualMaterialThickness,
    joineryType,
    joineryTolerance,
    toeKick
  ]);

  const onSubmit = (data) => {
    // Update store
    setCabinetType(data.cabinetType);
    setDimensions(
      parseFloat(data.width), 
      parseFloat(data.height), 
      parseFloat(data.depth)
    );
    setMaterialThickness(parseFloat(data.materialThickness), parseFloat(data.actualMaterialThickness));
    setJoineryType(data.joineryType);
    setJoineryTolerance(parseFloat(data.joineryTolerance));
    
    // Update toe kick settings
    setToeKick({
      enabled: data.toeKickEnabled,
      height: parseFloat(data.toeKickHeight),
      depth: parseFloat(data.toeKickDepth)
    });

    // Update back panel settings
    setBackPanel({
      enabled: data.backPanelType !== 'none',
      type: data.backPanelType,
      railHeight: parseFloat(data.backRailHeight)
    });

    // Calculate parts
    const calculator = new CabinetCalculator({
      cabinetType: data.cabinetType,
      width: parseFloat(data.width),
      height: parseFloat(data.height),
      depth: parseFloat(data.depth),
      materialThickness: parseFloat(data.materialThickness),
      actualMaterialThickness: parseFloat(data.actualMaterialThickness),
      joineryType: data.joineryType,
      joineryTolerance: parseFloat(data.joineryTolerance),
      toeKick: {
        enabled: data.toeKickEnabled,
        height: parseFloat(data.toeKickHeight),
        depth: parseFloat(data.toeKickDepth)
      },
      backPanel: {
        enabled: data.backPanelType !== 'none',
        type: data.backPanelType,
        railHeight: parseFloat(data.backRailHeight)
      },
      shelves: shelves
    });

    const parts = calculator.calculateParts();
    setParts(parts);
  };

  return (
    <form className="cabinet-form" onSubmit={handleSubmit(onSubmit)}>
      <h2>Cabinet Specifications</h2>
      
      {/* Cabinet Type */}
      <div className="form-group">
        <label htmlFor="cabinetType">Cabinet Type</label>
        <select 
          id="cabinetType"
          {...register('cabinetType', { required: true })}
        >
          <option value="base">Base Cabinet</option>
          <option value="wall">Wall Cabinet</option>
          <option value="tall">Tall Cabinet</option>
          <option value="drawer">Drawer Box</option>
        </select>
      </div>

      {/* Dimensions */}
      <div className="form-section">
        <h3>Dimensions (inches)</h3>
        
        <div className="form-group">
          <label htmlFor="width">Width</label>
          <input 
            id="width"
            type="number" 
            step="0.125"
            {...register('width', { 
              required: 'Width is required',
              min: { value: 6, message: 'Minimum width is 6"' },
              max: { value: 96, message: 'Maximum width is 96"' }
            })}
          />
          {errors.width && <span className="error">{errors.width.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="height">Height</label>
          <input 
            id="height"
            type="number" 
            step="0.125"
            {...register('height', { 
              required: 'Height is required',
              min: { value: 6, message: 'Minimum height is 6"' },
              max: { value: 96, message: 'Maximum height is 96"' }
            })}
          />
          {errors.height && <span className="error">{errors.height.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="depth">Depth</label>
          <input 
            id="depth"
            type="number" 
            step="0.125"
            {...register('depth', { 
              required: 'Depth is required',
              min: { value: 6, message: 'Minimum depth is 6"' },
              max: { value: 36, message: 'Maximum depth is 36"' }
            })}
          />
          {errors.depth && <span className="error">{errors.depth.message}</span>}
        </div>
      </div>

      {/* Material */}
      <div className="form-section">
        <h3>Material</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="materialThickness">Nominal Thickness</label>
            <select 
              id="materialThickness"
              {...register('materialThickness', { required: true })}
              onChange={(e) => {
                // Auto-set actual thickness when nominal is selected
                setValue('actualMaterialThickness', parseFloat(e.target.value));
              }}
            >
              <option value="0.25">1/4" (0.25")</option>
              <option value="0.5">1/2" (0.5")</option>
              <option value="0.75">3/4" (0.75")</option>
              <option value="1">1" (1.0")</option>
            </select>
            <small className="help-text">
              Standard material thickness designation
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="actualMaterialThickness">Actual Thickness (inches)</label>
            <input 
              id="actualMaterialThickness"
              type="number" 
              step="0.001"
              {...register('actualMaterialThickness', { 
                required: 'Actual thickness is required',
                min: { value: 0.1, message: 'Minimum 0.1"' },
                max: { value: 2, message: 'Maximum 2"' }
              })}
            />
            <small className="help-text">
              Measured thickness for CNC precision (e.g., 0.73" for 3/4" ply)
            </small>
            {errors.actualMaterialThickness && <span className="error">{errors.actualMaterialThickness.message}</span>}
          </div>
        </div>
      </div>

      {/* Joinery */}
      <div className="form-section">
        <h3>Joinery Type</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="joineryType">Joint Type</label>
            <select 
              id="joineryType"
              {...register('joineryType', { required: true })}
            >
              <option value="dado">Dado Joint</option>
              <option value="rabbet">Rabbet Joint</option>
              <option value="finger">Finger Joint</option>
              <option value="dovetail">Square Dovetail (Box Joint)</option>
              <option value="butt">Butt Joint</option>
            </select>
            <small className="help-text">
              Type of joint connection between parts
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="joineryTolerance">Joinery Tolerance (inches)</label>
            <input 
              id="joineryTolerance"
              type="number" 
              step="0.001"
              {...register('joineryTolerance', { 
                required: 'Tolerance is required',
                min: { value: 0, message: 'Minimum 0"' },
                max: { value: 0.1, message: 'Maximum 0.1"' }
              })}
            />
            <small className="help-text">
              Clearance for dado/groove cuts (0.002" - 0.005" recommended)
            </small>
            {errors.joineryTolerance && <span className="error">{errors.joineryTolerance.message}</span>}
          </div>
        </div>
      </div>

      {/* Toe Kick - Only for Base Cabinets */}
      {watchCabinetType === 'base' && (
        <div className="form-section">
          <h3>Toe Kick</h3>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox"
                {...register('toeKickEnabled')}
              />
              <span>Enable Toe Kick Recess</span>
            </label>
          </div>

          {watchToeKickEnabled && (
            <>
              <div className="form-group">
                <label htmlFor="toeKickHeight">Toe Kick Height (inches)</label>
                <input 
                  id="toeKickHeight"
                  type="number" 
                  step="0.25"
                  {...register('toeKickHeight', { 
                    min: { value: 3, message: 'Minimum 3"' },
                    max: { value: 6, message: 'Maximum 6"' }
                  })}
                />
                {errors.toeKickHeight && <span className="error">{errors.toeKickHeight.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="toeKickDepth">Toe Kick Depth (inches)</label>
                <input 
                  id="toeKickDepth"
                  type="number" 
                  step="0.25"
                  {...register('toeKickDepth', { 
                    min: { value: 2, message: 'Minimum 2"' },
                    max: { value: 4, message: 'Maximum 4"' }
                  })}
                />
                {errors.toeKickDepth && <span className="error">{errors.toeKickDepth.message}</span>}
              </div>
            </>
          )}
        </div>
      )}

      {/* Back Panel Options */}
      <div className="form-section">
        <h3>Back Panel</h3>
        
        <div className="form-group">
          <label htmlFor="backPanelType">Back Configuration</label>
          <select 
            id="backPanelType"
            {...register('backPanelType', { required: true })}
          >
            <option value="full">Full Back Panel (1/4" plywood)</option>
            <option value="rails">Mounting Rails Only (wall-mount)</option>
            <option value="none">No Back</option>
          </select>
          <small className="help-text">
            Full back provides rigidity. Rails save material and allow wall-mounting.
          </small>
        </div>

        {watchBackPanelType === 'rails' && (
          <div className="form-group">
            <label htmlFor="backRailHeight">Rail Height (inches)</label>
            <input 
              id="backRailHeight"
              type="number" 
              step="0.25"
              {...register('backRailHeight', { 
                min: { value: 2, message: 'Minimum 2"' },
                max: { value: 6, message: 'Maximum 6"' }
              })}
            />
            <small className="help-text">
              Height of horizontal mounting rails (typically 3-4")
            </small>
            {errors.backRailHeight && <span className="error">{errors.backRailHeight.message}</span>}
          </div>
        )}
      </div>

      {/* Shelves */}
      <div className="form-section">
        <h3>Shelves</h3>
        
        {shelves.length > 0 ? (
          <div className="items-list">
            {shelves.map((shelf, index) => (
              <div key={index} className="shelf-item">
                <div className="item-row">
                  <span>Shelf {index + 1} - {shelf.position?.toFixed(2)}" from bottom</span>
                  <button 
                    type="button" 
                    className="btn-remove"
                    onClick={() => removeShelf(index)}
                  >
                    Remove
                  </button>
                </div>
                <div className="shelf-controls">
                  <div className="shelf-type-control">
                    <label>Type:</label>
                    <div className="radio-group">
                      <label className="radio-label-inline">
                        <input
                          type="radio"
                          name={`shelf-${index}-type`}
                          value="fixed"
                          checked={shelf.type === 'fixed'}
                          onChange={() => updateShelf(index, { type: 'fixed' })}
                        />
                        <span>Fixed</span>
                      </label>
                      <label className="radio-label-inline">
                        <input
                          type="radio"
                          name={`shelf-${index}-type`}
                          value="adjustable"
                          checked={shelf.type === 'adjustable'}
                          onChange={() => updateShelf(index, { type: 'adjustable' })}
                        />
                        <span>Adjustable</span>
                      </label>
                    </div>
                  </div>
                  <div className="shelf-quantity-control">
                    <label htmlFor={`shelf-${index}-quantity`}>Quantity:</label>
                    <input
                      id={`shelf-${index}-quantity`}
                      type="number"
                      min="1"
                      max="10"
                      value={shelf.quantity || 1}
                      onChange={(e) => updateShelf(index, { quantity: parseInt(e.target.value) || 1 })}
                      className="quantity-input"
                    />
                  </div>
                </div>
                <div className="shelf-info">
                  <small className="helper-text">
                    {shelf.position ? `${(height - shelf.position - actualMaterialThickness).toFixed(2)}" clearance above shelf` : ''}
                  </small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-list">No shelves added</p>
        )}
        
        <div className="info-box">
          <small>
            <strong>Fixed shelves</strong> use dado grooves for permanent installation.
            <br />
            <strong>Adjustable shelves</strong> use pin holes (1.25" spacing, 0.197" diameter) for repositioning.
            <br />
            Shelves are automatically positioned proportionally (1 shelf = center, 2 shelves = thirds, etc.).
          </small>
        </div>
        
        <button 
          type="button" 
          className="btn-add"
          onClick={() => {
            // Position will be auto-calculated by useEffect
            addShelf(0);
          }}
        >
          + Add Shelf
        </button>
      </div>

      <button type="submit" className="btn-submit">Update Design</button>
    </form>
  );
}

export default CabinetForm;
