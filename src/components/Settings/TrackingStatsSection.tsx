import React from 'react';
import { Section, Row, Toggle } from './SettingsUI';

interface TrackingStatsSectionProps {
  trackIcing: boolean;
  setTrackIcing: (val: boolean) => void;
  trackOffside: boolean;
  setTrackOffside: (val: boolean) => void;
  trackSOG: boolean;
  setTrackSOG: (val: boolean) => void;
  trackSOGLocation: boolean;
  setTrackSOGLocation: (val: boolean) => void;
  trackFOW: boolean;
  setTrackFOW: (val: boolean) => void;
  faceoffLocation: boolean;
  setFaceoffLocation: (val: boolean) => void;
}

export const TrackingStatsSection: React.FC<TrackingStatsSectionProps> = ({
  trackIcing,
  setTrackIcing,
  trackOffside,
  setTrackOffside,
  trackSOG,
  setTrackSOG,
  trackSOGLocation,
  setTrackSOGLocation,
  trackFOW,
  setTrackFOW,
  faceoffLocation,
  setFaceoffLocation,
}) => {
  return (
    <Section title="TRACKING & STATS">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        <Row label="Icing">
          <Toggle checked={trackIcing} onChange={() => setTrackIcing(!trackIcing)} />
        </Row>
        <Row label="Offside">
          <Toggle checked={trackOffside} onChange={() => setTrackOffside(!trackOffside)} />
        </Row>
        <Row label="SOG">
          <Toggle
            checked={trackSOG}
            onChange={() => {
              const newVal = !trackSOG;
              setTrackSOG(newVal);
              if (!newVal) {
                setTrackSOGLocation(false);
              }
            }}
          />
        </Row>
        <Row label="SOG Location" disabled={!trackSOG}>
          <Toggle
            disabled={!trackSOG}
            checked={trackSOGLocation && trackSOG}
            onChange={() => setTrackSOGLocation(!trackSOGLocation)}
          />
        </Row>
        <Row label="FOW">
          <Toggle
            checked={trackFOW}
            onChange={() => {
              const newVal = !trackFOW;
              setTrackFOW(newVal);
              if (!newVal) {
                setFaceoffLocation(false);
              }
            }}
          />
        </Row>
        <Row label="Faceoff Location" disabled={!trackFOW}>
          <Toggle
            disabled={!trackFOW}
            checked={faceoffLocation && trackFOW}
            onChange={() => setFaceoffLocation(!faceoffLocation)}
          />
        </Row>
      </div>
    </Section>
  );
};
