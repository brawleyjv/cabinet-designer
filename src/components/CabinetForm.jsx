import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useCabinetStore from '../store/cabinetStore';
import CabinetCalculator from '../services/calculationService';
import NestingService from '../services/nestingService';
import './CabinetForm.css';

function CabinetForm() {
  const [nestingErrors, setNestingErrors] = useState([]);
  
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
    dividers,
    sheetWidth,
    sheetHeight,
    partSpacing,
    bitDiameter,
    edgePadding,
    setCabinetType,
    setDimensions,
    setMaterialThickness,
    setJoineryType,
    setJoineryTolerance,
    setToeKick,
    setBackPanel,
    setSheetSize,
    setPartSpacing,
    setBitDiameter,
    setEdgePadding,
    addShelf,
    removeShelf,
    addDivider,
    removeDivider,
    setParts,
    setSheets
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
      backRailHeight: backPanel.railHeight,
      sheetWidth,
      sheetHeight,
      partSpacing,
      bitDiameter,
      edgePadding
    }
  });

  const watchCabinetType = watch('cabinetType');
  const watchToeKickEnabled = watch('toeKickEnabled');
  const watchBackPanelType = watch('backPanelType');
  const watchSheetWidth = watch('sheetWidth');
  const watchSheetHeight = watch('sheetHeight');

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

    // Update sheet settings
    setSheetSize(parseFloat(data.sheetWidth), parseFloat(data.sheetHeight));
    setPartSpacing(parseFloat(data.partSpacing));
    setBitDiameter(parseFloat(data.bitDiameter));
    setEdgePadding(parseFloat(data.edgePadding));

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
      shelves: shelves,
      dividers: dividers
    });

    const parts = calculator.calculateParts();
    setParts(parts);

    // Nest parts on sheets
    const nesting = new NestingService(
      parseFloat(data.sheetWidth), 
      parseFloat(data.sheetHeight),
      parseFloat(data.bitDiameter),
      parseFloat(data.partSpacing),
      parseFloat(data.edgePadding)
    );
    const result = nesting.nestParts(parts);
    setSheets(result.sheets);
    setNestingErrors(result.errors);
    
    // Show alert if there are nesting errors
    if (result.errors.length > 0) {
      alert(`Warning: ${result.errors.length} part(s) are too large for the selected sheet size. See errors below the form.`);
    }
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
              <div key={index} className="item-row">
                <span>Shelf {index + 1} - {shelf.position}" from bottom</span>
                <button 
                  type="button" 
                  className="btn-remove"
                  onClick={() => removeShelf(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-list">No shelves added</p>
        )}
        
        <button 
          type="button" 
          className="btn-add"
          onClick={() => {
            const position = height / 2; // Default to middle
            addShelf(position);
          }}
        >
          + Add Shelf
        </button>
      </div>

      {/* Dividers */}
      <div className="form-section">
        <h3>Dividers</h3>
        
        {dividers.length > 0 ? (
          <div className="items-list">
            {dividers.map((divider, index) => (
              <div key={index} className="item-row">
                <span>Divider {index + 1} - {divider.position}" from left</span>
                <button 
                  type="button" 
                  className="btn-remove"
                  onClick={() => removeDivider(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-list">No dividers added</p>
        )}
        
        <button 
          type="button" 
          className="btn-add"
          onClick={() => {
            const position = width / 2; // Default to middle
            addDivider(position);
          }}
        >
          + Add Divider
        </button>
      </div>

      {/* Sheet Configuration */}
      <div className="form-section">
        <h3>Sheet Material & CNC Settings</h3>
        
        <div className="form-group">
          <label htmlFor="sheetSize">Sheet Size</label>
          <select 
            id="sheetSize"
            defaultValue="48x96"
            onChange={(e) => {
              const [w, h] = e.target.value.split('x').map(v => parseFloat(v));
              if (!isNaN(w) && !isNaN(h)) {
                setValue('sheetWidth', w);
                setValue('sheetHeight', h);
              }
            }}
          >
            <option value="24x48">2' × 4' (24" × 48")</option>
            <option value="48x48">4' × 4' (48" × 48")</option>
            <option value="48x96">4' × 8' (48" × 96")</option>
            <option value="48x120">4' × 10' (48" × 120")</option>
            <option value="60x60">5' × 5' (60" × 60")</option>
            <option value="60x96">5' × 8' (60" × 96")</option>
            <option value="60x120">5' × 10' (60" × 120")</option>
            <option value="custom">Custom Size</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sheetWidth">Sheet Width (inches)</label>
            <input 
              id="sheetWidth"
              type="number" 
              step="1"
              value={watchSheetWidth}
              {...register('sheetWidth', { 
                required: 'Width is required',
                min: { value: 12, message: 'Minimum 12"' },
                max: { value: 144, message: 'Maximum 144"' }
              })}
            />
            {errors.sheetWidth && <span className="error">{errors.sheetWidth.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="sheetHeight">Sheet Height (inches)</label>
            <input 
              id="sheetHeight"
              type="number" 
              step="1"
              value={watchSheetHeight}
              {...register('sheetHeight', { 
                required: 'Height is required',
                min: { value: 12, message: 'Minimum 12"' },
                max: { value: 144, message: 'Maximum 144"' }
              })}
            />
            {errors.sheetHeight && <span className="error">{errors.sheetHeight.message}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bitDiameter">CNC Bit Diameter (inches)</label>
            <input 
              id="bitDiameter"
              type="number" 
              step="0.0625"
              {...register('bitDiameter', { 
                required: 'Bit diameter is required',
                min: { value: 0.0625, message: 'Minimum 1/16"' },
                max: { value: 1, message: 'Maximum 1"' }
              })}
            />
            <small className="help-text">
              Diameter of your CNC router bit (1/8" = 0.125")
            </small>
            {errors.bitDiameter && <span className="error">{errors.bitDiameter.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="edgePadding">Edge Padding (inches)</label>
            <input 
              id="edgePadding"
              type="number" 
              step="0.0625"
              {...register('edgePadding', { 
                required: 'Edge padding is required',
                min: { value: 0, message: 'Minimum 0"' },
                max: { value: 3, message: 'Maximum 3"' }
              })}
            />
            <small className="help-text">
              Padding from sheet edge to parts (0.5" recommended)
            </small>
            {errors.edgePadding && <span className="error">{errors.edgePadding.message}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="partSpacing">Additional Part Spacing (inches)</label>
          <input 
            id="partSpacing"
            type="number" 
            step="0.0625"
            {...register('partSpacing', { 
              required: 'Spacing is required',
              min: { value: 0, message: 'Minimum 0"' },
              max: { value: 1, message: 'Maximum 1"' }
            })}
          />
          <small className="help-text">
            Extra padding between parts beyond bit diameter (0.25" recommended)
          </small>
          {errors.partSpacing && <span className="error">{errors.partSpacing.message}</span>}
        </div>
      </div>

      <button type="submit" className="btn-submit">Update Design</button>
      
      {/* Nesting Errors */}
      {nestingErrors.length > 0 && (
        <div className="nesting-errors">
          <h3 className="error">⚠️ Nesting Errors</h3>
          <p>The following parts are too large for the selected sheet size:</p>
          <ul>
            {nestingErrors.map((error, index) => (
              <li key={index} className="error-item">
                <strong>{error.part.name}</strong>: {error.part.width}" × {error.part.height}"
                <br />
                <small>{error.reason}</small>
              </li>
            ))}
          </ul>
          <p className="error-suggestion">
            <strong>Suggestions:</strong>
            <br />• Increase sheet size (try 5' × 8' or 5' × 10')
            <br />• Reduce cabinet dimensions
            <br />• Decrease edge padding or bit spacing
          </p>
        </div>
      )}
    </form>
  );
}

export default CabinetForm;
