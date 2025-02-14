import {
  PermissionResponse,
  PermissionStatus,
  EventEmitter,
  Subscription,
  Platform,
  PermissionExpiration,
} from 'expo-modules-core';

/**
 * @hidden
 */
export type Listener<E> = (event: E) => void;

type NativeSensorModule = any;

/**
 * A base class for subscribable sensors. The events emitted by this class are measurements
 * specified by the parameter type `M`.
 */
export default class DeviceSensor<M> {
  _nativeModule: NativeSensorModule;
  _nativeEmitter: EventEmitter;
  _nativeEventName: string;
  _listenerCount: number;

  constructor(nativeSensorModule: NativeSensorModule, nativeEventName: string) {
    this._nativeModule = nativeSensorModule;
    this._nativeEmitter = new EventEmitter(nativeSensorModule);
    this._nativeEventName = nativeEventName;
    this._listenerCount = 0;
  }

  addListener = (listener: Listener<M>): Subscription => {
    const subscription = this._nativeEmitter.addListener(this._nativeEventName, listener);
    subscription.remove = () => this.removeSubscription(subscription);
    this._listenerCount++;
    return subscription;
  };

  /**
   * Returns boolean which signifies if sensor has any listeners registered.
   */
  hasListeners = (): boolean => {
    return this._listenerCount > 0;
  };

  /**
   * Returns the registered listeners count.
   */
  getListenerCount = (): number => {
    return this._listenerCount;
  };

  /**
   * Removes all registered listeners.
   */
  removeAllListeners = (): void => {
    this._listenerCount = 0;
    this._nativeEmitter.removeAllListeners(this._nativeEventName);
  };

  /**
   * Removes the given subscription.
   * @param subscription A subscription to remove.
   */
  removeSubscription = (subscription: Subscription): void => {
    this._listenerCount--;
    this._nativeEmitter.removeSubscription(subscription);
  };

  /**
   * Set the sensor update interval.
   * @param intervalMs Desired interval value in milliseconds.
   */
  setUpdateInterval = (intervalMs: number): void => {
    if (!this._nativeModule.setUpdateInterval) {
      console.warn(`expo-sensors: setUpdateInterval() is not supported on ${Platform.OS}`);
    } else {
      this._nativeModule.setUpdateInterval(intervalMs);
    }
  };

  /**
   * > **info** You should always check the sensor availability before attempting to use it.
   * @return A promise that resolves to a `boolean` denoting the availability of the sensor.
   */
  isAvailableAsync = async (): Promise<boolean> => {
    if (!this._nativeModule.isAvailableAsync) {
      return false;
    } else {
      return await this._nativeModule.isAvailableAsync();
    }
  };

  /**
   * Checks user's permissions for accessing sensor.
   */
  getPermissionsAsync = async (): Promise<PermissionResponse> => {
    if (!this._nativeModule.getPermissionsAsync) {
      return defaultPermissionsResponse;
    } else {
      return await this._nativeModule.getPermissionsAsync();
    }
  };

  /**
   * Asks the user to grant permissions for accessing sensor.
   */
  requestPermissionsAsync = async (): Promise<PermissionResponse> => {
    if (!this._nativeModule.requestPermissionsAsync) {
      return defaultPermissionsResponse;
    } else {
      return await this._nativeModule.requestPermissionsAsync();
    }
  };
}

const defaultPermissionsResponse: PermissionResponse = {
  granted: true,
  expires: 'never',
  canAskAgain: true,
  status: PermissionStatus.GRANTED,
};

export { PermissionExpiration, PermissionResponse, PermissionStatus, Subscription };
